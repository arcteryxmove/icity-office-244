import { useTranslations } from "next-intl";

import { Section } from "@/components/Section";
import { Reveal } from "@/components/ui/Reveal";

const PHONE = "8 (909) 379-80-15";
const PHONE_HREF = "tel:+79093798015";
const EMAIL = "kryakushina@arenda-34.ru";
const EMAIL_HREF = "mailto:kryakushina@arenda-34.ru";

const LINK_CLASS =
  "text-paper underline decoration-paper/40 decoration-1 underline-offset-[0.5rem] " +
  "transition-colors duration-[var(--duration-ui)] ease-ui hover:decoration-paper " +
  "focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-paper";

/**
 * 14 — футер. Единственное место, где padding-bottom оправдан: ниже ничего нет.
 *
 * Ни реквизитов юрлица, ни политики конфиденциальности: их нет в брифе, а
 * строка-заглушка под них — тот самый признак сгенерированного сайта. Года
 * в копирайте тоже нет: он устареет сам и ничего не сообщает.
 */
export function FooterSection() {
  const t = useTranslations("footer");

  return (
    <Section id="footer" tone="ink" rhythm="sm" as="footer" padBottom>
      <div className="grid-page gap-y-[3.2rem]">
        <h2 className="col-span-4 text-[2.2rem] font-extralight leading-[1.2] md:col-start-2 md:col-span-10 md:text-[2.8rem] lg:col-start-2 lg:col-span-13 lg:text-[3.2rem]">
          {t("title")}
        </h2>

        <Reveal
          as="p"
          className="col-span-4 text-[1.5rem] leading-[1.5] text-paper md:col-start-2 md:col-span-6 lg:col-start-2 lg:col-span-10 lg:text-[1.6rem]"
        >
          {t("address")}
        </Reveal>

        <Reveal
          index={1}
          className="col-span-4 flex flex-col gap-[0.8rem] md:col-start-8 md:col-span-4 lg:col-start-14 lg:col-span-10"
        >
          <p className="text-[1.5rem] leading-[1.4] text-paper lg:text-[1.6rem]">
            {t("manager")}
          </p>
          <p className="flex flex-wrap items-baseline gap-x-[1.2rem] gap-y-[0.6rem] text-[1.5rem] leading-[1.4] lg:text-[1.6rem]">
            <a href={PHONE_HREF} className={`tabular ${LINK_CLASS}`}>
              {PHONE}
            </a>
            <span aria-hidden className="text-paper/50">
              ·
            </span>
            <a href={EMAIL_HREF} className={`break-words ${LINK_CLASS}`}>
              {EMAIL}
            </a>
            <span aria-hidden className="text-paper/50">
              ·
            </span>
            <span className="text-paper">{t("messenger")}</span>
          </p>
        </Reveal>

        <p className="col-span-4 border-t border-hairline pt-[2.4rem] text-[1.5rem] leading-[1.4] text-paper md:col-start-2 md:col-span-10 lg:col-start-2 lg:col-span-23">
          {t("owner")}
        </p>
      </div>

      {/* Запас под липкую панель: на мобильном она висит поверх и иначе
          накрыла бы последнюю строку. На десктопе панели нет. */}
      <div aria-hidden className="h-[7.2rem] md:hidden" />
    </Section>
  );
}
