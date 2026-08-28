"use client";

import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { useNearViewport } from "@/hooks/useNearViewport";

/**
 * Реестр отложенных островов. Ключ — строка, поэтому его можно передать
 * из серверного компонента; сами импорты живут здесь, в клиентском модуле,
 * и попадают в отдельные чанки.
 *
 * Добавляя новый интерактив ниже первого экрана, дописывай строку сюда,
 * а не тяни компонент в серверную секцию напрямую.
 */
const ISLANDS = {
  termsCalculator: () => import("@/components/sections/TermsCalculator"),
  statsCounters: () => import("@/components/sections/StatsCounters"),
  planCanvas: () => import("@/components/sections/PlanCanvas"),
  interiorGallery: () => import("@/components/sections/InteriorGallery"),
  contactForm: () => import("@/components/sections/ContactForm"),
} as const;

export type IslandName = keyof typeof ISLANDS;

type LazyIslandProps = {
  island: IslandName;
  /**
   * Серверная разметка блока. Уезжает в HTML как есть, поэтому текст и
   * вёрстка видны до всякого JS. Обязана совпадать по геометрии с островом,
   * иначе подмена даст скачок и CLS.
   */
  fallback: ReactNode;
  className?: string;
};

/**
 * Остров поведения. Разметка приходит с сервера, скрипт — отдельным чанком
 * и только когда блок подошёл к экрану на 300px.
 *
 * Зачем: каждый клиентский компонент ниже первого экрана иначе едет в бандл
 * гидратации первого экрана. На сегодняшнем составе выигрыш небольшой, но
 * он растёт с каждым островом: галерея с Flip и форма заявки тянут за собой
 * заметно больше кода, чем калькулятор.
 */
export function LazyIsland({ island, fallback, className }: LazyIslandProps) {
  const [ref, near] = useNearViewport<HTMLDivElement>();
  const [Loaded, setLoaded] = useState<ComponentType | null>(null);

  useEffect(() => {
    if (!near) return;
    let alive = true;
    void ISLANDS[island]().then((mod) => {
      if (alive) setLoaded(() => mod.default);
    });
    return () => {
      alive = false;
    };
  }, [near, island]);

  return (
    <div ref={ref} className={className}>
      {Loaded ? <Loaded /> : fallback}
    </div>
  );
}
