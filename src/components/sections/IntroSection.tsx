import { SCENES_READY } from "@/config/scenes";
import { Section } from "@/components/Section";
import { IntroScene } from "@/components/three";
import { useTranslations } from "next-intl";

/**
 * 01 — Залёт внутрь офиса. Поверх сцены — цена и площадь, кнопка «Пропустить»
 * с первой секунды. Один раз за сессию, не на мобильном, не при reduced-motion.
 *
 * Пока сцены нет, секция не рендерится вовсе. Причина не только в правиле
 * «нет ассета — нет блока»: заглушка стояла выше hero и её h2 оказывался
 * первым заголовком страницы, до h1. Порядок заголовков ломался на ровном
 * месте — замерено обходом h1–h6.
 */
export function IntroSection() {
  const t = useTranslations("sections");

  if (!SCENES_READY.intro) return null;

  return (
    <Section
      id="intro"
      tone="sky"
      rhythm="sm"
      eyebrow="01"
      media={
        <div className="aspect-[4/5] md:aspect-[16/9] w-full">
          <IntroScene />
        </div>
      }
    >
      <h2 className="text-[3.6rem] font-extralight leading-[1.1] md:text-[5.6rem] lg:text-[7.2rem]">
        {t("intro")}
      </h2>
    </Section>
  );
}
