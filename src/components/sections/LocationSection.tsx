import { useTranslations } from "next-intl";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { MAPS_URL, ROUTE_GROUPS } from "@/content/location";

/**
 * 11 — адрес и тайминги.
 *
 * Интерактивной карты здесь нет: ключа Яндекс.Карт в брифе нет, а заглушка
 * под карту — тот самый серый прямоугольник, которого в проекте быть не
 * должно. Секция закончена сама по себе; когда ключ появится, карта встанет
 * полноширинным кадром через проп media, и текст сдвигать не придётся.
 *
 * Минуты набраны Unbounded 200 с tabular-nums, но мельче, чем цифры в 03:
 * там сводка объекта, здесь служебная шкала, и одинаковый кегль читался бы
 * повтором. Число выключено вправо в колонке фиксированной ширины, поэтому
 * единицы выстраиваются в столбец и при однозначных, и при двузначных.
 */
export function LocationSection() {
  const t = useTranslations("location");

  return (
    <Section id="location" tone="mist" rhythm="md" eyebrow={t("eyebrow")}>
      <div className="grid-page gap-y-[4.8rem]">
        <div className="col-span-4 md:col-start-2 md:col-span-10 lg:col-start-2 lg:col-span-10">
          <h2 className="text-[3.2rem] font-extralight leading-[1.12] md:text-[4.4rem] lg:text-[5.2rem]">
            {t("title")}
          </h2>
          <Reveal
            as="p"
            className="mt-[2.4rem] max-w-[38rem] text-[1.6rem] leading-[1.5] text-slate md:text-[1.7rem]"
          >
            {t("address")}
          </Reveal>
          <Button
            href={MAPS_URL}
            external
            newTab
            variant="secondary"
            className="mt-[2.4rem]"
          >
            {t("mapsCta")}
            <span className="sr-only"> — {t("mapsHint")}</span>
          </Button>
        </div>

        <div className="col-span-4 grid gap-x-[var(--gutter)] gap-y-[4rem] md:col-start-2 md:col-span-10 lg:col-start-13 lg:col-span-12 lg:gap-y-[4.8rem]">
          {ROUTE_GROUPS.map((group, index) => (
            <Reveal key={group.id} as="section" index={index + 1}>
              <h3 className="text-[1.3rem] font-medium uppercase tracked-wide text-slate">
                {t(`groups.${group.id}.title` as never)}
              </h3>
              <ul className="mt-[1.6rem] border-t border-hairline">
                {group.routes.map((route) => (
                  <li
                    key={route.id}
                    className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)] items-baseline gap-x-[1.6rem] border-b border-hairline py-[1.4rem] md:grid-cols-[minmax(0,10rem)_minmax(0,1fr)] md:gap-x-[2rem]"
                  >
                    <span className="flex items-baseline gap-[0.5rem]">
                      <span className="font-display tabular min-w-[2ch] text-right text-[2.4rem] font-extralight leading-[1.1] tracking-[-0.02em] text-ink md:text-[2.8rem]">
                        {route.minutes}
                      </span>
                      <span className="text-[1.4rem] leading-[1.35] text-slate">
                        {t("minutes", { count: route.minutes })}
                      </span>
                    </span>
                    <span className="block text-[1.5rem] leading-[1.35] text-ink md:text-[1.6rem]">
                      {t(`groups.${group.id}.routes.${route.id}.place` as never)}
                      {route.note ? (
                        <span className="block text-[1.4rem] text-slate">
                          {t(`groups.${group.id}.routes.${route.id}.note` as never)}
                        </span>
                      ) : null}
                    </span>
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
