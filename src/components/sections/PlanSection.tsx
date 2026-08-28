import { useTranslations } from "next-intl";
import { SCENES_READY } from "@/config/scenes";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/ui/Reveal";
import { FloorPlan3D } from "@/components/three";
import { LazyIsland } from "@/components/ui/LazyIsland";
import { PlanFrame } from "./PlanFrame";

/**
 * 06 — 2D-план помещения 113Н со слоем зон плюс слот объёмной планировки.
 * При расхождении геометрии источник — план, а не рендеры.
 */
export function PlanSection() {
  const t = useTranslations("plan");

  return (
    <Section id="plan" tone="sky" rhythm="md" eyebrow={t("eyebrow")} overlap>
      <h2 className="max-w-[34rem] text-[3.2rem] font-extralight leading-[1.12] md:max-w-[52rem] md:text-[4.4rem] lg:max-w-[64rem] lg:text-[5.6rem]">
        {t("title")}
      </h2>

      {/* Оправа и подпись — серверные, растр и слой зон приезжают островом.
          Без JS остаётся noscript-картинка: план не исчезает совсем. */}
      <Reveal className="mt-[4rem] md:mt-[5.6rem]">
      <LazyIsland
        island="planCanvas"
        fallback={
          <PlanFrame caption={t("hint")}>
            <noscript>
              {/* next/image здесь неприменим: он рендерится скриптом.
                  Отдаём мастер как есть — случай редкий. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/plan/plan-113n.webp"
                alt={t("imageAlt")}
                className="absolute inset-0 h-full w-full object-contain"
              />
            </noscript>
          </PlanFrame>
        }
      />
      </Reveal>

      <Reveal index={1} as="p" className="mt-[2.4rem] text-[1.5rem] text-slate">
        {t("note")}
      </Reveal>

      {/* Слот партнёра. Пока floorPlan: false — не рендерит ничего. */}
      {SCENES_READY.floorPlan ? (
        <div className="mt-[5.6rem] aspect-[4/3] w-full md:aspect-[16/9]">
          <FloorPlan3D />
        </div>
      ) : null}
    </Section>
  );
}
