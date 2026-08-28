import { useFormatter, useTranslations } from "next-intl";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/ui/Reveal";
import { VIEW_FACTS } from "@/content/view";

/**
 * 08 — что видно с 23 этажа и куда выходят окна.
 *
 * Горизонтальной ленты здесь нет и не должно быть, пока нечего в неё класть:
 * кадров с видом из окна в проекте два, и оба заняты — один в hero, второй
 * в галерее. Секция собрана на данных и закончена сама по себе; когда кадры
 * придут, лента встанет между текстом и нижней строкой.
 *
 * Ни серых прямоугольников, ни подписей «здесь будет фото»: единственное
 * упоминание будущих кадров — честная строка внизу, обычным текстом.
 *
 * Числа те же, что в секции 03, поэтому подача другая: не крупная сводка,
 * а компактный столбец с волосяными линиями, иначе две секции читались бы
 * как повтор.
 */
export function ViewSection() {
  const t = useTranslations("view");
  const format = useFormatter();

  return (
    <Section id="view" tone="sky" rhythm="lg" eyebrow={t("eyebrow")}>
      <div className="grid-page gap-y-[4.8rem]">
        <div className="col-span-4 md:col-start-2 md:col-span-10 lg:col-start-2 lg:col-span-11">
          <h2 className="text-[3.2rem] font-extralight leading-[1.12] md:text-[4.4rem] lg:text-[5.6rem]">
            {t("title")}
          </h2>
          <Reveal
            as="p"
            className="mt-[2.4rem] max-w-[46rem] text-[1.6rem] leading-[1.5] text-slate md:text-[1.7rem]"
          >
            {t("lead")}
          </Reveal>
        </div>

        <Reveal
          as="dl"
          index={1}
          className="col-span-4 md:col-start-2 md:col-span-10 lg:col-start-14 lg:col-span-11 lg:self-end"
        >
          {VIEW_FACTS.map((fact) => (
            <div
              key={fact.id}
              className="flex flex-col gap-[0.4rem] border-t border-hairline py-[2rem] last:border-b md:grid md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] md:items-baseline md:gap-x-[2rem]"
            >
              <dd className="font-display tabular text-[2.8rem] font-extralight leading-[1.1] tracking-[-0.02em] text-ink md:text-[3.2rem]">
                {format.number(fact.value, {
                  minimumFractionDigits: fact.decimals,
                  maximumFractionDigits: fact.decimals,
                })}
                <span className="ml-[0.6rem] whitespace-nowrap text-[0.5em] text-slate">
                  {t(`facts.${fact.id}.unit` as never)}
                </span>
              </dd>
              <dt className="text-[1.5rem] leading-[1.35] text-ink md:text-[1.6rem]">
                {t(`facts.${fact.id}.label` as never)}
              </dt>
            </div>
          ))}
        </Reveal>

        <Reveal
          as="p"
          index={2}
          className="col-span-4 text-[1.5rem] leading-[1.5] text-slate md:col-start-2 md:col-span-10 lg:col-start-2 lg:col-span-11"
        >
          {t("note")}
        </Reveal>
      </div>
    </Section>
  );
}
