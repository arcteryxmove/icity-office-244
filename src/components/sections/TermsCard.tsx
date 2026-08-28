import { useTranslations } from "next-intl";
import type { CSSProperties } from "react";
import { DEPOSIT, FIRST_MONTH, RENT } from "@/content/terms";
import { formatRub } from "@/lib/format";

type TermsCardProps = {
  term: number;
  /**
   * Есть обработчик — карточка живая и управляемая. Нет — это серверная
   * разметка до приезда острова: те же строки, тот же размер, но ползунок
   * ещё ничего не пересчитывает.
   */
  onTermChange?: (term: number) => void;
  sliderId?: string;
};

/**
 * Карточка расчёта. Один и тот же компонент рисует и серверную заглушку,
 * и живой калькулятор — поэтому подмена не может изменить высоту и дать CLS.
 *
 * Клиентской директивы здесь нет намеренно: из серверной секции компонент
 * не тянет за собой ни байта скрипта.
 */
export function TermsCard({ term, onTermChange, sliderId }: TermsCardProps) {
  const t = useTranslations("terms.calc");
  const live = typeof onTermChange === "function";

  const total = RENT.monthly * term;
  const progress =
    ((term - RENT.minTerm) / (RENT.maxTerm - RENT.minTerm)) * 100;
  const termLabel = t("months", { count: term });

  const rows = [
    { key: "total", label: t("total"), value: total },
    { key: "deposit", label: t("deposit"), value: DEPOSIT },
    { key: "firstMonth", label: t("firstMonth"), value: FIRST_MONTH },
  ];

  return (
    <div className="rounded-card border border-hairline bg-paper p-[2.4rem] md:p-[3.2rem]">
      <div className="flex items-baseline justify-between gap-[1.6rem]">
        <label
          htmlFor={sliderId}
          className="text-[1.5rem] leading-none text-slate"
        >
          {t("legend")}
        </label>
        <output
          htmlFor={sliderId}
          className="tabular font-display text-[2.2rem] font-extralight leading-none tracking-[-0.02em] text-ink md:text-[2.6rem]"
        >
          {termLabel}
        </output>
      </div>

      <input
        id={sliderId}
        type="range"
        min={RENT.minTerm}
        max={RENT.maxTerm}
        step={1}
        {...(live
          ? { value: term, onChange: (e) => onTermChange(Number(e.target.value)) }
          : { defaultValue: term })}
        aria-label={t("sliderLabel")}
        aria-valuetext={termLabel}
        className="range-term mt-[2rem]"
        style={{ "--range-progress": `${progress}%` } as CSSProperties}
      />

      {/* Линии внутри белой карточки лежат не на фоне секции, поэтому
          --hairline здесь не читается: белое — эталонная поверхность,
          и значение токена для неё это ровно --mist. */}
      <dl className="mt-[2.8rem] border-t border-mist">
        {rows.map((row) => (
          <div
            key={row.key}
            className="flex items-baseline justify-between gap-[1.6rem] border-b border-mist py-[1.4rem]"
          >
            <dt className="text-[1.5rem] leading-[1.3] text-slate">{row.label}</dt>
            <dd className="tabular whitespace-nowrap text-[1.6rem] font-medium leading-[1.3] text-ink">
              {formatRub(row.value)}&nbsp;₽
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-[1.6rem] text-[1.3rem] leading-[1.45] text-slate">
        {t("note")}
      </p>
    </div>
  );
}
