import { useTranslations } from "next-intl";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/ui/Reveal";

const GROUPS = ["shared", "access"] as const;

/**
 * 10 — Space Tower и инфраструктура комплекса.
 *
 * Класс A+, биометрия и Smart Building по брифу — гигиенические факторы:
 * их отсутствие исключает объект, наличие само по себе не продаёт. Поэтому
 * они идут плотными строками в общем списке, а не карточками во весь экран,
 * и класс здания стоит последним словом вводного абзаца, а не в заголовке.
 *
 * Стоимости машиноместа в брифе нет — в списке её нет тоже.
 */
export function BuildingSection() {
  const t = useTranslations("building");

  return (
    <Section id="building" tone="paper" rhythm="lg" eyebrow={t("eyebrow")}>
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

        <div className="col-span-4 grid gap-x-[var(--gutter)] gap-y-[4rem] md:col-start-2 md:col-span-10 md:grid-cols-2 lg:col-start-2 lg:col-span-23">
          {GROUPS.map((group, index) => (
            <Reveal key={group} as="section" index={index + 1}>
              <h3 className="text-[1.3rem] font-medium uppercase tracked-wide text-slate">
                {t(`groups.${group}.title` as never)}
              </h3>
              <ul className="mt-[1.6rem] border-t border-hairline">
                {(t.raw(`groups.${group}.items`) as string[]).map((item) => (
                  <li
                    key={item}
                    className="border-b border-hairline py-[1.2rem] text-[1.5rem] leading-[1.35] text-ink md:text-[1.6rem]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
