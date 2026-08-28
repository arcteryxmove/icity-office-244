"use client";

import { useEffect } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { HEADING } from "@/lib/motion";

/**
 * Заголовки: разрезка по строкам и выезд снизу из-под маски.
 *
 * Компонент один на страницу и находит заголовки сам. Иначе пришлось бы
 * тащить клиентскую обёртку в каждую серверную секцию ради одного эффекта.
 *
 * Три вещи, без которых это ломается, и все три проверены замером:
 *
 * 1. Ждём document.fonts.ready. Разрезка по подложке даёт другое число
 *    строк и другие переносы, после подмены шрифта строки едут.
 * 2. Заголовок, уже находящийся в кадре в момент разрезки, НЕ анимируется.
 *    GSAP приезжает в простое, то есть после LCP: заголовок первого экрана
 *    к этому моменту уже нарисован, и спрятать его под маску, чтобы выехать
 *    заново, значит моргнуть готовым текстом. Такие заголовки просто
 *    остаются на месте.
 * 3. lh-fix: маска с overflow: hidden срезает хвосты у, р, д, ц, щ.
 *    Компенсация — в globals.css, классы split-mask и split-line.
 */
export function HeadingMotion() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    // При prefers-reduced-motion разрезки нет вовсе: заголовки видны сразу.
    if (reducedMotion) return;

    let cancelled = false;
    let revert: (() => void) | null = null;

    const start = async () => {
      const { gsap, SplitText } = await import("@/lib/gsap");
      // Шрифт должен быть подменён до разрезки, иначе строки посчитаются
      // по подстановочному и после подмены поедут.
      await document.fonts.ready;
      if (cancelled) return;

      const headings = Array.from(
        document.querySelectorAll<HTMLElement>("h1:not(.sr-only), h2:not(.sr-only)"),
      );
      const splits = headings.map((heading) =>
        SplitText.create(heading, {
          type: "lines",
          mask: "lines",
          linesClass: "split-line",
          // Пересчёт при смене ширины и после подмены шрифтов: без него
          // строки, разрезанные на одной ширине, остаются на всех.
          autoSplit: true,
          onSplit(self) {
            for (const mask of self.masks) mask.classList.add("split-mask");

            // Заголовок уже в кадре — показываем как есть, без выезда.
            const rect = heading.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) {
              gsap.set(self.lines, { yPercent: 0 });
              return undefined;
            }

            return gsap.from(self.lines, {
              yPercent: HEADING.from,
              duration: HEADING.duration,
              ease: HEADING.ease,
              stagger: HEADING.stagger,
              scrollTrigger: { trigger: heading, start: "top 88%", once: true },
            });
          },
        }),
      );

      revert = () => splits.forEach((split) => split.revert());
    };

    void start();

    return () => {
      cancelled = true;
      revert?.();
    };
  }, [reducedMotion]);

  return null;
}
