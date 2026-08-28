"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";
import { GpuRelease } from "./GpuRelease";
import type { SceneContract } from "../types";

/**
 * ЗАГЛУШКА. Партнёр заменяет содержимое <Canvas> и не трогает ничего вокруг.
 *
 * Интро: залёт внутрь офиса. Сцена заканчивается ВНУТРИ помещения, тем же
 * ракурсом, с которого начинается hero — шва между интро и страницей быть
 * не должно. Бюджет веса: 8 МБ.
 *
 * Обязательства сцены: звать onProgress по мере загрузки, onReady одним
 * вызовом после первого готового кадра, onError вместо собственного экрана
 * ошибки. Не рендерить кадры при active === false.
 */
export default function IntroSceneImpl({
  active,
  onReady,
  onProgress,
}: SceneContract) {
  useEffect(() => {
    // Загружать нечего: заглушка сообщает о готовности честно и сразу.
    onProgress?.(100);
    onReady?.();
  }, [onReady, onProgress]);

  return (
    <Canvas
      className="h-full w-full"
      // never вместо демонтажа: возврат во вьюпорт не пересоздаёт контекст.
      frameloop={active ? "always" : "never"}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 1.6, 6], fov: 40 }}
    >
      <GpuRelease />
      {/* Сцена партнёра. */}
    </Canvas>
  );
}
