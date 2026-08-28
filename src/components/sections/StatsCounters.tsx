"use client";

import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { STATS } from "@/content/stats";
import { StatsGrid } from "./StatsGrid";

/**
 * Остров счётчиков. Отсчёт — единственное, ради чего сюда едет скрипт,
 * поэтому он и приезжает отдельным чанком у экрана, а не в бандле
 * гидратации первого экрана.
 */
export default function StatsCounters() {
  return (
    <StatsGrid
      numbers={STATS.map((stat) => (
        <AnimatedNumber key={stat.id} value={stat.value} decimals={stat.decimals} />
      ))}
    />
  );
}
