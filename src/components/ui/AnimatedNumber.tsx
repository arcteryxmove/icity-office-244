"use client";

import { useLocale } from "next-intl";
import { useMemo, useRef } from "react";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { COUNTER } from "@/lib/motion";
import { NumberShell } from "./NumberShell";

type AnimatedNumberProps = {
  value: number;
  /** Знаков после запятой. Фиксировано: иначе ширина числа скачет на счёте. */
  decimals?: number;
  /** Секунды. */
  duration?: number;
  className?: string;
};

/**
 * Счётчик с табличными цифрами: ширина знака постоянна, поэтому число
 * не дёргает соседей во время отсчёта, а дробная часть не мигает — форматтер
 * всегда печатает ровно `decimals` знаков, от 0,0 до 244,1.
 *
 * Отсчёт ведёт requestAnimationFrame, а не motion: библиотека утянула бы
 * в бандл несколько десятков килобайт ради одной кривой.
 *
 * Кривая здесь СВОЯ — [0.25, 0.1, 0.25, 1], 1200 мс, — а не общая кривая
 * появления. Почему именно так, с числами, написано в lib/motion.
 *
 * НЕ применять к цене в hero. Цена должна читаться сразу и целиком —
 * это правило проекта, а отсчёт от нуля её на секунду прячет.
 *
 * Разметка на сервере содержит конечное значение: без JS и до гидратации
 * на экране правильная цифра, а не ноль.
 */
export function AnimatedNumber({
  value,
  decimals = 0,
  duration = COUNTER.duration,
  className,
}: AnimatedNumberProps) {
  const locale = useLocale();
  const ref = useRef<HTMLSpanElement>(null);

  const format = useMemo(() => {
    const formatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return (n: number) => formatter.format(n);
  }, [locale, decimals]);

  useIsomorphicLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Читаем настройку прямо здесь, а не через хук: хук отдаёт false на
    // первом проходе, и человек с выключенной анимацией успел бы увидеть
    // кадр с нулём.
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || typeof IntersectionObserver === "undefined") {
      node.textContent = format(value);
      return;
    }

    node.textContent = format(0);

    let frame = 0;
    let startedAt = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const tick = (now: number) => {
          if (!startedAt) startedAt = now;
          const progress = Math.min(1, (now - startedAt) / (duration * 1000));
          node.textContent = format(value * COUNTER.ease(progress));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(node);

    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, decimals, duration, format]);

  return <NumberShell text={format(value)} valueRef={ref} className={className} />;
}
