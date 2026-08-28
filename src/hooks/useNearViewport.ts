"use client";

import { useEffect, useRef, useState } from "react";

/** Запас до вьюпорта: столько же, сколько у отложенного растра плана. */
export const NEAR_VIEWPORT_MARGIN = "300px 0px";

/**
 * Срабатывает один раз, когда элемент подошёл к экрану на заданный запас.
 * Дальше наблюдатель отключается: возвращать блок в исходное состояние
 * нам негде и незачем.
 */
export function useNearViewport<T extends HTMLElement>(
  rootMargin: string = NEAR_VIEWPORT_MARGIN,
) {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Нет наблюдателя — показываем сразу, а не прячем навсегда.
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNear(true);
        io.disconnect();
      },
      { rootMargin },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [rootMargin]);

  return [ref, near] as const;
}
