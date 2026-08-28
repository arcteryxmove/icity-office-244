import { useFormatter, useTranslations } from "next-intl";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/ui/Reveal";
import { LazyIsland } from "@/components/ui/LazyIsland";
import { STATS } from "@/content/stats";
import { NumberShell } from "@/components/ui/NumberShell";
import { StatsGrid } from "./StatsGrid";

/**
 * 03 — 244,1 м² · 23 из 61 · 3,8 м · 26 мест.
 *
 * h2 визуально скрыт: на экране роль подписи выполняет надзаголовок, но
 * в структуре документа уровень нужен — иначе между h1 в hero и h2 в
 * «Оффере» появляется дырка, и скринридер читает сводку без имени.
 *
 * Сетка два на два держится и на 390 — в столбик четыре цифры читаются
 * как список, а не как сводка.
 *
 * В серверной разметке числа сразу конечные. Счётчики приезжают островом:
 * секция лежит ниже первого экрана на обеих канвах.
 */
export function NumbersSection() {
  const t = useTranslations("numbers");
  const format = useFormatter();

  // Оболочка та же, что у счётчика: подмена острова не меняет геометрию.
  const staticNumbers = STATS.map((stat) => (
    <NumberShell
      key={stat.id}
      text={format.number(stat.value, {
        minimumFractionDigits: stat.decimals,
        maximumFractionDigits: stat.decimals,
      })}
    />
  ));

  return (
    <Section id="numbers" tone="mist" rhythm="md" eyebrow={t("eyebrow")}>
      <h2 className="sr-only">{t("srTitle")}</h2>

      <Reveal className="mt-[3.2rem] md:mt-[4rem]">
        <LazyIsland island="statsCounters" fallback={<StatsGrid numbers={staticNumbers} />} />
      </Reveal>

      <Reveal
        index={1}
        as="p"
        className="mt-[4.8rem] text-[1.5rem] leading-[1.5] text-slate md:mt-[6.4rem] md:text-[1.6rem]"
      >
        {t("note")}
      </Reveal>
    </Section>
  );
}
