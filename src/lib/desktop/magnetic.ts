import { gsap } from "@/lib/gsap";
import { MAGNETIC } from "@/lib/motion";

type Pull = { x: (value: number) => void; y: (value: number) => void; held: boolean };

/**
 * Магнитные кнопки. Кнопка тянется к указателю в поле шириной 40px вокруг
 * своих границ и не уезжает дальше 6px. Едва заметно: если движение видно
 * явно — это уже перебор.
 *
 * Смещение считается от центра и нормируется половиной поля, а вектор
 * ограничивается по длине, а не покоординатно. Иначе по диагонали
 * получается 8,5px вместо шести: угол поля дальше от центра, чем сторона.
 *
 * Список целей собирается один раз и обновляется по MutationObserver:
 * кнопка формы приезжает островом на подходе к секции 13, и без наблюдателя
 * она осталась бы немагнитной — молча, без единой ошибки.
 *
 * На тач-устройствах модуль не запускается вовсе: он под (pointer: fine).
 */
export function initMagnetic(): () => void {
  const pulls = new WeakMap<HTMLElement, Pull>();
  let targets: HTMLElement[] = [];
  let stale = true;
  let frame = 0;
  let held = 0;
  let pointerX = 0;
  let pointerY = 0;

  const pullFor = (element: HTMLElement): Pull => {
    let pull = pulls.get(element);
    if (!pull) {
      pull = {
        x: gsap.quickTo(element, "x", { duration: MAGNETIC.pull, ease: "power3.out" }),
        y: gsap.quickTo(element, "y", { duration: MAGNETIC.pull, ease: "power3.out" }),
        held: false,
      };
      pulls.set(element, pull);
    }
    return pull;
  };

  const release = (element: HTMLElement) => {
    const pull = pulls.get(element);
    if (!pull?.held) return;
    pull.held = false;
    held -= 1;
    gsap.to(element, { x: 0, y: 0, duration: MAGNETIC.release, ease: "power3.out" });
  };

  const apply = () => {
    frame = 0;
    if (stale) {
      targets = Array.from(document.querySelectorAll<HTMLElement>("[data-magnetic]"));
      stale = false;
    }

    for (const element of targets) {
      const box = element.getBoundingClientRect();
      // Кнопки за пределами экрана не считаем: замер прямоугольника дешёвый,
      // но их на странице шесть, а событие приходит на каждый кадр.
      if (
        box.width === 0 ||
        box.bottom < -MAGNETIC.radius ||
        box.top > window.innerHeight + MAGNETIC.radius
      ) {
        release(element);
        continue;
      }

      const halfW = box.width / 2 + MAGNETIC.radius;
      const halfH = box.height / 2 + MAGNETIC.radius;
      const dx = (pointerX - (box.left + box.width / 2)) / halfW;
      const dy = (pointerY - (box.top + box.height / 2)) / halfH;

      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        release(element);
        continue;
      }

      const length = Math.hypot(dx, dy);
      const scale = length > 1 ? 1 / length : 1;
      const pull = pullFor(element);
      if (!pull.held) held += 1;
      pull.held = true;
      pull.x(dx * scale * MAGNETIC.maxShift);
      pull.y(dy * scale * MAGNETIC.maxShift);
    }
  };

  const schedule = () => {
    if (frame === 0) frame = requestAnimationFrame(apply);
  };

  const onMove = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    schedule();
  };

  // Прокрутка под неподвижным указателем уводит кнопку из-под него, а
  // смещение остаётся прежним — притянутая кнопка уезжает вместе со
  // страницей и держит свои 6px там, где курсора уже нет. Пересчитываем,
  // но только пока хоть одна кнопка притянута: если не притянута ни одна,
  // прокрутка ничего испортить не может, и обработчик не тратит кадры.
  const onScroll = () => {
    if (held > 0) schedule();
  };

  const observer = new MutationObserver(() => {
    stale = true;
  });
  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });

  return () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("scroll", onScroll);
    observer.disconnect();
    if (frame !== 0) cancelAnimationFrame(frame);
    for (const element of document.querySelectorAll<HTMLElement>("[data-magnetic]")) {
      gsap.killTweensOf(element);
      gsap.set(element, { clearProps: "transform" });
    }
  };
}
