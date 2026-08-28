import { gsap, ScrollTrigger } from "@/lib/gsap";
import { OVERLAP } from "@/lib/motion";

/**
 * Наезд секций. Запускается только на стыках, помеченных в разметке
 * пропом `overlap` компонента Section, — там, где с экрана уходит
 * изображение. На текстовых секциях эффекта не видно, а кадры он тратит.
 *
 * Что двигается: содержимое секции, но не её бокс. Разница не косметическая.
 * Сдвиг самого бокса открыл бы над секцией полосу голого фона страницы —
 * предыдущая секция уже закончилась, под ней ничего нет. Двигая только
 * содержимое, мы получаем то же самое зрительно: граница тонов стоит,
 * содержимое отстаёт и уезжает под следующую секцию, а та накрывает его
 * сверху просто потому, что позже в потоке.
 *
 * Уход по прозрачности — в сторону --mist, не в чёрное: на светлом фоне
 * затемнение даёт грязь. Вуаль — отдельный слой внутри секции, поэтому
 * тон уходит целиком, вместе с текстом, кадрами и линиями, а не по
 * отдельным элементам.
 */
export function initOverlap(): () => void {
  const timelines: gsap.core.Timeline[] = [];
  const veils: HTMLElement[] = [];

  for (const section of document.querySelectorAll<HTMLElement>("[data-overlap]")) {
    const content = Array.from(section.children) as HTMLElement[];
    if (content.length === 0) continue;

    const veil = document.createElement("div");
    veil.dataset.overlapVeil = "";
    veil.setAttribute("aria-hidden", "true");
    section.appendChild(veil);
    veils.push(veil);

    for (const node of content) node.dataset.overlapShift = "";

    const shift = Math.min(OVERLAP.maxShift, window.innerHeight * OVERLAP.shiftRatio);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        // Проход ровно в один экран: от момента, когда нижний край секции
        // вошёл снизу, до момента, когда он ушёл сверху.
        start: "bottom bottom",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    tl.to(content, { y: shift, ease: OVERLAP.ease, force3D: true }, 0).to(
      veil,
      { opacity: OVERLAP.veil, ease: OVERLAP.ease },
      0,
    );

    timelines.push(tl);
  }

  return () => {
    for (const tl of timelines) {
      tl.scrollTrigger?.kill();
      tl.kill();
    }
    for (const veil of veils) veil.remove();
    for (const node of document.querySelectorAll<HTMLElement>("[data-overlap-shift]")) {
      gsap.set(node, { clearProps: "transform" });
      delete node.dataset.overlapShift;
    }
    ScrollTrigger.refresh();
  };
}
