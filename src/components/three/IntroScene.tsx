"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { SCENES_READY } from "@/config/scenes";
import { SceneSlot } from "./SceneSlot";
import type { SceneSlotProps } from "./types";
import { INTRO_TIMEOUT_MS } from "@/lib/motion";

// ssr: false обязателен: three обращается к window на импорте.
// loading оставлен пустым — индикатор рисует SceneSlot, чтобы он был
// одинаковым у всех трёх слотов.
const Scene = dynamic(() => import("./scenes/intro.scene"), {
  ssr: false,
  loading: () => null,
});

export function IntroScene(props: SceneSlotProps) {
  const t = useTranslations("scenes3d");

  // Сцены нет — нет и слота. dynamic ниже так и не вызовется,
  // чанк three в сеть не уйдёт.
  if (!SCENES_READY.intro) return null;

  return (
    <SceneSlot
      {...props}
      scene={Scene}
      label={t("intro")}
      // TODO: статичный кадр вместо null, когда появятся ассеты.
      // Пустой fallback честнее серого прямоугольника с подписью.
      fallback={null}
      timeoutMs={INTRO_TIMEOUT_MS}
    />
  );
}
