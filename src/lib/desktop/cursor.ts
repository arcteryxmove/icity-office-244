import { gsap } from "@/lib/gsap";
import { CURSOR } from "@/lib/motion";

/**
 * Кастомный курсор: небольшое кольцо, которое чуть отстаёт от указателя и
 * увеличивается над интерактивным.
 *
 * Нативный курсор при этом остаётся видимым. Это не оговорка: cursor: none
 * в проекте не появляется ни разу. Полная замена курсора ломает
 * доступность — системный курсор несёт состояние (текст, ссылка, занято),
 * и подменить его кольцом нельзя.
 *
 * Заливки на увеличении нет. С ней кольцо садилось на кнопку светлым
 * пятном во всю её высоту и читалось как значок, приклеенный к кнопке,
 * а не как курсор. Осталась одна волосяная окружность, как в покое.
 *
 * Цвет берётся с фактической поверхности под указателем, а не с тона
 * секции. Тона мало: белая карточка формы лежит внутри azure-секции, и
 * кольцо цвета выворотки пропало бы на ней целиком — ровно там, где стоит
 * форма заявки. Поверхность ищется вверх по дереву до первого непрозрачного
 * фона, светлота считается по WCAG.
 */
const INTERACTIVE =
  'a[href], button, summary, label, input, textarea, select, [role="button"]';

/** Ближайший непрозрачный фон вверх по дереву. */
function surfaceOf(element: Element): string {
  let node: Element | null = element;
  while (node) {
    const background = getComputedStyle(node).backgroundColor;
    const parts = background.match(/[\d.]+/g);
    if (parts && parts.length >= 3 && (parts.length < 4 || Number(parts[3]) > 0.5)) {
      return background;
    }
    node = node.parentElement;
  }
  return "";
}

function isDark(color: string): boolean {
  const parts = color.match(/[\d.]+/g);
  if (!parts || parts.length < 3) return false;
  const channel = (value: string) => {
    const v = Number(value) / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const luminance =
    0.2126 * channel(parts[0]) + 0.7152 * channel(parts[1]) + 0.0722 * channel(parts[2]);
  return luminance < CURSOR.darkSurface;
}

export function initCursor(): () => void {
  const ring = document.createElement("div");
  ring.dataset.cursor = "";
  ring.setAttribute("aria-hidden", "true");
  document.body.appendChild(ring);

  gsap.set(ring, { scale: CURSOR.restScale, opacity: 0, force3D: true });

  const toX = gsap.quickTo(ring, "x", { duration: CURSOR.follow, ease: "power3" });
  const toY = gsap.quickTo(ring, "y", { duration: CURSOR.follow, ease: "power3" });

  let placed = false;
  let over = false;
  let sampled: Element | null = null;

  const onMove = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;

    if (!placed) {
      placed = true;
      // Первый кадр ставим на место, иначе кольцо прилетает из угла экрана.
      gsap.set(ring, { x: event.clientX, y: event.clientY });
      gsap.to(ring, { opacity: 1, duration: 0.3, ease: "power2.out" });
    }
    toX(event.clientX);
    toY(event.clientY);

    const target = event.target instanceof Element ? event.target : null;
    // Поверхность и интерактивность пересчитываются только при смене
    // элемента под указателем: внутри одной кнопки считать нечего.
    if (target === sampled) return;
    sampled = target;

    const nextOver = Boolean(target?.closest(INTERACTIVE));
    if (nextOver !== over) {
      over = nextOver;
      if (over) ring.dataset.cursorOver = "";
      else delete ring.dataset.cursorOver;
      gsap.to(ring, {
        scale: over ? CURSOR.hoverScale : CURSOR.restScale,
        duration: 0.35,
        ease: "power3.out",
      });
    }

    if (target) {
      ring.dataset.cursorSurface = isDark(surfaceOf(target)) ? "dark" : "light";
    }
  };

  const hide = () => {
    gsap.to(ring, { opacity: 0, duration: 0.2 });
    placed = false;
    sampled = null;
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("pointerleave", hide);
  window.addEventListener("blur", hide);

  return () => {
    window.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerleave", hide);
    window.removeEventListener("blur", hide);
    gsap.killTweensOf(ring);
    ring.remove();
  };
}
