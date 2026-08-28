"use client";

import { useEffect, useState } from "react";

/** Совпадает с первым брейкпоинтом из @theme: --breakpoint-md: 650px. */
const QUERY = "(max-width: 649.98px)";

/**
 * На мобильном не запускаются интро, кастомный курсор, магнитные кнопки,
 * наезд секций и звук. Решение принимается по ширине, а не по user-agent:
 * узкое окно на десктопе — тот же случай.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    setIsMobile(mq.matches);

    const onChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
