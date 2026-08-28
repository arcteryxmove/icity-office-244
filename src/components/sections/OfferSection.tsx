import { useTranslations } from "next-intl";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/ui/Reveal";

/** Порядок блоков задан здесь: он же порядок появления. */
const BLOCKS = ["market", "ready", "payment"] as const;

/**
 * 04 — почему дешевле рынка и почему без ремонта.
 *
 * Диапазон 20–36% показывается целиком. Вести цифрой 36% нельзя: разброс
 * читается как замер, лучший край — как реклама. Правило из брифа.
 */
export function OfferSection() {
  const t = useTranslations("offer");

  return (
    <Section id="offer" tone="sky" rhythm="lg" eyebrow={t("eyebrow")}>
      <h2 className="max-w-[30rem] text-[3.2rem] font-extralight leading-[1.12] md:max-w-[46rem] md:text-[4.4rem] lg:max-w-[62rem] lg:text-[5.6rem]">
        {t("title")}
      </h2>

      <div className="mt-[5.6rem] grid gap-x-[var(--gutter)] gap-y-[4.8rem] md:mt-[6.4rem] md:grid-cols-2 lg:grid-cols-3">
        {BLOCKS.map((id, index) => (
          <Reveal key={id} as="article" index={index}>
            <h3 className="font-display text-[2.2rem] font-light leading-[1.2] tracking-[-0.02em] text-ink md:text-[2.6rem]">
              {t(`blocks.${id}.title` as never)}
            </h3>
            <p className="mt-[1.6rem] max-w-[38rem] text-[1.6rem] leading-[1.5] text-slate">
              {t(`blocks.${id}.text` as never)}
            </p>
          </Reveal>
        ))}
      </div>

      <Reveal
        as="p"
        className="mt-[5.6rem] text-[1.5rem] leading-[1.5] text-ink md:mt-[6.4rem] md:text-[1.6rem]"
      >
        {t("note")}
      </Reveal>
    </Section>
  );
}
