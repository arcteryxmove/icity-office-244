"use client";

import type { ComponentProps, CSSProperties, ElementType, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { REVEAL } from "@/lib/motion";
import { cn } from "@/lib/cn";

type RevealProps = {
  children: ReactNode;
  /** Порядковый номер в группе: даёт задержку index × 100 мс. */
  index?: number;
  as?: ElementType;
  className?: string;
};

/**
 * Появление: сдвиг 2.5rem плюс прозрачность, 1000 мс, ease [0.16, 1, 0.3, 1],
 * шаг 100 мс. Однотипно везде — параметры лежат токенами в globals.css.
 *
 * Сам переход описан в CSS, здесь только наблюдатель и флаг. Библиотеку
 * анимации не тянем: бандл первого экрана дороже.
 *
 * Скрытое состояние включается только под `@media (scripting: enabled)`.
 * Если скрипт не выполнился, блок просто виден сразу — контент никогда
 * не остаётся в opacity 0 из-за упавшего JS.
 */
export function Reveal({ children, index = 0, as = "div", className }: RevealProps) {
  // Union из ElementType схлопывает пропсы — фиксируем форму тега.
  const Tag = as as ElementType<ComponentProps<"div">>;
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        io.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal=""
      data-shown={shown ? "true" : undefined}
      style={{ "--reveal-delay": `${index * REVEAL.stagger * 1000}ms` } as CSSProperties}
      className={cn(className)}
    >
      {children}
    </Tag>
  );
}
