import type { ComponentProps, ElementType, ReactNode } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { cn } from "@/lib/cn";

type Tone = "sky" | "mist" | "paper" | "azure" | "ink";

/** Ритм. Шаги намеренно неровные: одинаковая высота секций читается как шаблон. */
type Rhythm = "sm" | "md" | "lg";

type SectionProps = {
  id: string;
  children: ReactNode;
  tone?: Tone;
  eyebrow?: ReactNode;
  /**
   * Полноширинный кадр. Рендерится ДО надзаголовка и снимает верхний отступ,
   * чтобы изображение начиналось у самого края секции: иначе граница между
   * секциями не читается — это правило выведено замером, а не вкусом.
   */
  media?: ReactNode;
  rhythm?: Rhythm;
  /**
   * Нижний отступ. На весь сайт допускается не более трёх раз — только там,
   * где следующая секция того же тона и край иначе слипнется.
   */
  padBottom?: boolean;
  /**
   * Наезд на стыке: уходя, секция сдвигается вниз и уходит в сторону --mist,
   * следующая накрывает её сверху. Ставится только там, где с экрана уходит
   * изображение, — на текстовом стыке эффекта не видно, а кадры он тратит.
   * Решение принимается в самой секции, рядом с причиной; сам эффект живёт
   * в src/lib/desktop/overlap.ts и на мобильном не запускается.
   */
  overlap?: boolean;
  as?: ElementType;
  className?: string;
};

/**
 * Вертикальный ритм задаётся ТОЛЬКО здесь. Ни одна секция не ставит себе
 * padding-top сама, иначе ритм расползается и его уже не собрать.
 *
 * min-height не ставится сознательно: высота — следствие контента, а
 * min-height у собранной секции держит пустой хвост.
 */
export function Section({
  id,
  children,
  tone = "sky",
  eyebrow,
  media,
  rhythm = "md",
  padBottom = false,
  overlap = false,
  as = "section",
  className,
}: SectionProps) {
  // Union из ElementType схлопывает пропсы в never — фиксируем форму тега.
  const Tag = as as ElementType<ComponentProps<"section">>;

  const tones: Record<Tone, string> = {
    sky: "bg-sky text-ink",
    mist: "bg-mist text-ink",
    paper: "bg-paper text-ink",
    azure: "bg-azure text-paper",
    ink: "bg-ink text-paper",
  };

  const rhythms: Record<Rhythm, string> = {
    sm: "pt-[var(--rhythm-sm)]",
    md: "pt-[var(--rhythm-md)]",
    lg: "pt-[var(--rhythm-lg)]",
  };

  return (
    <Tag
      id={id}
      data-tone={tone}
      data-overlap={overlap ? "" : undefined}
      className={cn(
        "relative w-full",
        tones[tone],
        media ? "pt-0" : rhythms[rhythm],
        padBottom && "pb-[var(--rhythm-sm)]",
        className,
      )}
    >
      {media ? <div className="w-full">{media}</div> : null}

      <div className={cn("container-page", media && "pt-[var(--rhythm-sm)]")}>
        {eyebrow ? <Eyebrow className="mb-[1.6rem]">{eyebrow}</Eyebrow> : null}
        {children}
      </div>
    </Tag>
  );
}
