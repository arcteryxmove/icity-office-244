"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";
import { GpuRelease } from "./GpuRelease";
import type { SceneContract } from "../types";

/**
 * ЗАГЛУШКА. Партнёр заменяет содержимое <Canvas> и не трогает ничего вокруг.
 *
 * Объёмная планировка. Источник геометрии — 2D-план, не рендеры: при
 * расхождении по помещению верен план. Бюджет веса: 5 МБ.
 *
 * Обязательства сцены: onProgress по мере загрузки, onReady после первого
 * готового кадра, onError вместо собственного экрана ошибки.
 */
export default function FloorPlan3DImpl({
  active,
  onReady,
  onProgress,
}: SceneContract) {
  useEffect(() => {
    onProgress?.(100);
    onReady?.();
  }, [onReady, onProgress]);

  return (
    <Canvas
      className="h-full w-full"
      frameloop={active ? "always" : "never"}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 8, 8], fov: 35 }}
    >
      <GpuRelease />
      {/* Сцена партнёра. */}
    </Canvas>
  );
}
