"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";
import { GpuRelease } from "./GpuRelease";
import type { SceneContract } from "../types";

/**
 * ЗАГЛУШКА. Партнёр заменяет содержимое <Canvas> и не трогает ничего вокруг.
 *
 * Виртуальный тур по помещению. Тур внешний: если партнёр отдаёт его
 * айфреймом, содержимое этого файла заменяется на iframe, а обвязка
 * SceneSlot остаётся — прогресс, ошибка и fallback нужны и там.
 */
export default function VirtualTourImpl({
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
      camera={{ position: [0, 1.6, 0.1], fov: 70 }}
    >
      <GpuRelease />
      {/* Сцена партнёра. */}
    </Canvas>
  );
}
