import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Ref } from "react";
import { INTERIOR_SHOTS } from "@/content/interior";
import { PARALLAX } from "@/lib/motion";

type InteriorGridProps = {
  /** Есть обработчик — плитки кликабельны. Нет — это серверная разметка. */
  onOpen?: (index: number) => void;
  thumbRef?: (index: number) => Ref<HTMLDivElement>;
  /** Индекс кадра, который сейчас летит в просмотрщик: его плитку прячем. */
  hiddenIndex?: number | null;
};

/**
 * Сетка кадров. Один компонент рисует и серверную заглушку, и живую
 * галерею: разница только в наличии обработчика, поэтому подмена острова
 * не двигает вёрстку.
 *
 * Подписи — под кадром, а не поверх: текст на рендер не кладём.
 */
export function InteriorGrid({ onOpen, thumbRef, hiddenIndex }: InteriorGridProps) {
  const t = useTranslations("interior");
  const live = typeof onOpen === "function";

  return (
    <ul className="grid grid-cols-1 gap-x-[var(--gutter)] gap-y-[3.2rem] md:grid-cols-2 lg:grid-cols-4">
      {INTERIOR_SHOTS.map((shot, index) => {
        const caption = t(`shots.${shot.id}` as never);

        const frame = (
          <div
            ref={thumbRef?.(index)}
            // Своя скорость на каждую плитку: четыре одинаковых окна с общей
            // скоростью читаются как один сдвинутый блок, а не как глубина.
            data-parallax={PARALLAX.gallery[index % PARALLAX.gallery.length]}
            className="relative aspect-[16/10] w-full overflow-hidden rounded-image bg-mist"
            style={hiddenIndex === index ? { visibility: "hidden" } : undefined}
          >
            <Image
              src={shot.src}
              alt={caption}
              fill
              sizes="(min-width: 1275px) 24vw, (min-width: 650px) 46vw, 92vw"
              quality={85}
              className="object-cover"
            />
          </div>
        );

        const body = (
          <>
            {frame}
            <span className="mt-[1.2rem] block text-[1.4rem] leading-[1.4] text-slate">
              {caption}
            </span>
          </>
        );

        return (
          <li key={shot.id}>
            {live ? (
              <button
                type="button"
                onClick={() => onOpen(index)}
                aria-label={`${t("open")}: ${caption}`}
                className="block w-full cursor-pointer border-0 bg-transparent p-0 text-left"
              >
                {body}
              </button>
            ) : (
              <figure className="block w-full text-left">{body}</figure>
            )}
          </li>
        );
      })}
    </ul>
  );
}
