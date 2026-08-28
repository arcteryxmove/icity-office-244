"use client";

import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

/**
 * Отдаёт видеопамять при размонтировании сцены. R3F освобождает объекты сам,
 * но WebGL-контекст живёт до сборки мусора, а браузер держит их не больше
 * шестнадцати: три слота на странице плюс перезаходы — и контексты кончаются.
 */
export function GpuRelease() {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    return () => {
      gl.dispose();
      gl.forceContextLoss();
    };
  }, [gl]);

  return null;
}
