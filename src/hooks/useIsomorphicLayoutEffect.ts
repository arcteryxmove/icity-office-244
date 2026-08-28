import { useEffect, useLayoutEffect } from "react";

/**
 * useLayoutEffect на клиенте, useEffect на сервере.
 * Нужен везде, где измеряем DOM до кадра: SplitText, Flip, ScrollTrigger.
 * Прямой useLayoutEffect при SSR печатает предупреждение в консоль.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
