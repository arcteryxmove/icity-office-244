import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { STATS } from "@/content/stats";

type StatsGridProps = {
  /** Узел с числом на каждую цифру, в порядке STATS. Всё остальное общее. */
  numbers: ReactNode[];
};

/**
 * Сетка цифр. Отличие серверной заглушки от острова — ровно в одном узле
 * на ячейку: конечное число против счётчика. Поэтому геометрия совпадает
 * и подмена не двигает вёрстку.
 *
 * Клиентской директивы нет: из серверной секции не тянет ни байта скрипта.
 */
export function StatsGrid({ numbers }: StatsGridProps) {
  const t = useTranslations("numbers");

  return (
    <dl className="grid grid-cols-2 gap-x-[var(--gutter)] gap-y-[4.8rem] md:gap-y-[6.4rem] lg:grid-cols-4 lg:gap-y-0">
      {STATS.map((stat, index) => {
        const unit = t(`items.${stat.id}.unit` as never);
        return (
          <div key={stat.id}>
            <dd className="font-display font-extralight tracking-[-0.02em] text-ink text-[3.6rem] leading-[1.05] md:text-[5.2rem] lg:text-[6.4rem]">
              {numbers[index]}
              {unit ? (
                <span className="ml-[0.6rem] whitespace-nowrap text-[0.42em] text-slate">
                  {unit}
                </span>
              ) : null}
            </dd>
            <dt className="mt-[1.2rem] text-[1.5rem] leading-[1.4] text-ink md:text-[1.6rem]">
              {t(`items.${stat.id}.label` as never)}
            </dt>
          </div>
        );
      })}
    </dl>
  );
}
