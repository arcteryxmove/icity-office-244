import { SCENES_READY } from "@/config/scenes";
import { Section } from "@/components/Section";
import { VirtualTour } from "@/components/three";
import { useTranslations } from "next-intl";

/**
 * 09 — слот виртуального тура. Тур внешний.
 *
 * Пока сцены нет, секция не рендерится вовсе — как и секция 01. Причина та
 * же: пустая секция оставляла бы блок с одним заголовком-заглушкой, а её h2
 * висел бы в структуре документа без содержимого.
 */
export function TourSection() {
  const t = useTranslations("sections");

  if (!SCENES_READY.tour) return null;

  return (
    <Section
      id="tour"
      tone="paper"
      rhythm="sm"
      eyebrow="09"
      media={
        <div className="aspect-[4/5] md:aspect-[2/1] w-full">
          <VirtualTour />
        </div>
      }
    >
      <h2 className="text-[3.6rem] font-extralight leading-[1.1] md:text-[5.6rem] lg:text-[7.2rem]">
        {t("tour")}
      </h2>
    </Section>
  );
}
