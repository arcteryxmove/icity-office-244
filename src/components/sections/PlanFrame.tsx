import type { HTMLAttributes, ReactNode, Ref } from "react";
import { PLAN_VIEWBOX } from "@/content/planZones";
import { PARALLAX } from "@/lib/motion";
import { cn } from "@/lib/cn";

type PlanFrameProps = {
  /** Содержимое кадра: растр и слой зон. */
  children?: ReactNode;
  /** Строка под планом: подсказка или название активной зоны. */
  caption: ReactNode;
  captionStrong?: boolean;
  /**
   * Ссылка и пропсы горизонтального прокрутчика. Ставит только остров:
   * он делает прокрутчик доступным с клавиатуры, когда план шире экрана.
   * Серверная заглушка не передаёт ничего и остаётся без единого атрибута
   * поведения — мышью и пальцем прокрутка работает и без скрипта.
   */
  scrollerRef?: Ref<HTMLDivElement>;
  scrollerProps?: HTMLAttributes<HTMLDivElement>;
};

/**
 * Оправа плана: горизонтальная прокрутка на узкой канве, кадр с точным
 * соотношением растра и строка подписи под ним.
 *
 * Один и тот же компонент держит и серверную заглушку, и остров — поэтому
 * высота блока одинакова до и после приезда скрипта, CLS нулевой.
 *
 * Клиентской директивы нет: из серверной секции не тянет ни байта скрипта.
 */
export function PlanFrame({
  children,
  caption,
  captionStrong,
  scrollerRef,
  scrollerProps,
}: PlanFrameProps) {
  return (
    // Блочный слой: растр и слой зон делят систему координат и обязаны ехать
    // вместе, поэтому глубины внутри кадра нет — весь блок вместе с подписью
    // идёт одним слоем против текста секции, на медленном крае диапазона.
    <div data-parallax-block={PARALLAX.plan}>
      <div className="relative">
        {/* На узкой канве план не влезает читаемым: даём горизонтальную
            прокрутку внутри контейнера. Страница при этом остаётся без
            горизонтального скролла — контейнер обрезает по себе. */}
        <div
          ref={scrollerRef}
          {...scrollerProps}
          className="-mx-[var(--margin-page)] overflow-x-auto px-[var(--margin-page)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-azure lg:mx-0 lg:overflow-visible lg:px-0"
        >
          <div
            className="relative w-[88rem] md:w-full"
            style={{ aspectRatio: `${PLAN_VIEWBOX.w} / ${PLAN_VIEWBOX.h}` }}
          >
            {children}
          </div>
        </div>

        {/* На узкой канве план шире экрана. Растушёвка у правого края —
            единственный намёк, что его можно протянуть; без неё половина
            плана выглядит как весь план. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-[calc(var(--margin-page)*-1)] w-[6rem] bg-gradient-to-l from-sky to-transparent md:hidden"
        />
      </div>

      {/* Высота зафиксирована: подпись появляется и исчезает, вёрстка стоит. */}
      <p
        aria-live="polite"
        className="mt-[1.6rem] flex h-[2.6rem] items-center text-[1.5rem] leading-none"
      >
        <span className={cn(captionStrong ? "font-medium text-ink" : "text-slate")}>
          {caption}
        </span>
      </p>
    </div>
  );
}
