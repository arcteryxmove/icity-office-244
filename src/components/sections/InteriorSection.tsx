import { useTranslations } from "next-intl";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/ui/Reveal";
import { LazyIsland } from "@/components/ui/LazyIsland";
import { InteriorGrid } from "./InteriorGrid";

/**
 * 07 — отделка и общие пространства комплекса.
 *
 * По разделу «Статус ассетов» кадры показывают здание, а не помещение 113Н:
 * ни надзаголовок, ни h2, ни подписи не утверждают обратного, и строка под
 * галереей говорит об этом прямо.
 *
 * Сетка приходит с сервера, поведение и gsap — островом.
 */
export function InteriorSection() {
  const t = useTranslations("interior");

  return (
    <Section id="interior" tone="paper" rhythm="md" eyebrow={t("eyebrow")} overlap>
      <h2 className="max-w-[34rem] text-[3.2rem] font-extralight leading-[1.12] md:max-w-[52rem] md:text-[4.4rem] lg:max-w-[68rem] lg:text-[5.6rem]">
        {t("title")}
      </h2>

      <Reveal className="mt-[4.8rem] md:mt-[5.6rem]">
        <LazyIsland island="interiorGallery" fallback={<InteriorGrid />} />
      </Reveal>

      <Reveal index={1} as="p" className="mt-[3.2rem] text-[1.5rem] leading-[1.5] text-slate">
        {t("note")}
      </Reveal>
    </Section>
  );
}
