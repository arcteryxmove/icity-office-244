import type { ComponentProps, ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

type EyebrowProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
};

/**
 * Надзаголовок: Onest 500, uppercase, трекинг +0.12em.
 * Цвет берётся из --eyebrow: его задаёт тон секции в globals.css, а не
 * компонент. Жёсткий text-slate был нечитаем на azure и ink.
 *
 * Компенсация трекинга живёт в утилите tracked-wide — без неё последняя
 * буква выносит контейнер на несколько пикселей вправо и растягивает страницу.
 */
export function Eyebrow({ children, as = "p", className }: EyebrowProps) {
  // Union из ElementType схлопывает пропсы в never — фиксируем форму тега.
  const Tag = as as ElementType<ComponentProps<"p">>;

  return (
    <Tag
      className={cn(
        "font-body text-[1.2rem] font-medium uppercase tracked-wide text-[var(--eyebrow)]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
