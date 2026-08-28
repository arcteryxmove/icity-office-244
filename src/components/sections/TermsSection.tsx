import { useTranslations } from "next-intl";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/ui/Reveal";
import { TERM_ROWS } from "@/content/terms";
import { LazyIsland } from "@/components/ui/LazyIsland";
import { RENT } from "@/content/terms";
import { TermsCard } from "./TermsCard";

/**
 * 05 — состав платежа и калькулятор срока.
 *
 * Тон здесь суше остальных секций: ни одного оценочного слова, только
 * параметр и значение. Человек в этом месте считает деньги.
 *
 * Строки про индексацию ставки нет: в брифе такого условия нет, а прочерк
 * вместо значения читается как «не знаем» и вызывает лишний вопрос.
 */
export function TermsSection() {
  const t = useTranslations("terms");

  return (
    <Section id="terms" tone="mist" rhythm="md" eyebrow={t("eyebrow")}>
      <h2 className="text-[3.2rem] font-extralight leading-[1.12] md:text-[4.4rem] lg:text-[5.6rem]">
        {t("title")}
      </h2>

      <div className="mt-[4.8rem] grid gap-x-[var(--gutter)] gap-y-[4rem] md:mt-[5.6rem] lg:grid-cols-[minmax(0,1fr)_minmax(0,40rem)] lg:gap-x-[6.4rem]">
        <Reveal as="dl" className="border-t border-hairline md:max-w-[56rem] lg:max-w-[64rem]">
          {TERM_ROWS.map((id) => (
            <div
              key={id}
              className="flex flex-col gap-y-[0.4rem] border-b border-hairline py-[1.6rem] md:flex-row md:items-baseline md:justify-between md:gap-x-[2rem]"
            >
              <dt className="text-[1.5rem] leading-[1.35] text-slate md:text-[1.6rem]">
                {t(`rows.${id}.k` as never)}
              </dt>
              <dd className="tabular text-[1.5rem] leading-[1.35] text-ink md:text-[1.6rem]">
                {t(`rows.${id}.v` as never)}
              </dd>
            </div>
          ))}
        </Reveal>

        {/* Поведение калькулятора приезжает островом. Разметка карточки —
            серверная, с сроком по умолчанию: тот же компонент, та же высота,
            подмена не двигает вёрстку. */}
        <Reveal index={1} className="md:max-w-[46rem] lg:max-w-none lg:self-start">
          <LazyIsland island="termsCalculator" fallback={<TermsCard term={RENT.defaultTerm} />} />
        </Reveal>
      </div>
    </Section>
  );
}
