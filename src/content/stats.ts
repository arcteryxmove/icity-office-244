/**
 * Цифры секции 03. Все четыре — из раздела «Объект» в CLAUDE.md,
 * ни одна не выведена и не округлена по дороге.
 *
 * decimals фиксируют дробную часть при отсчёте: 244,1 считается как
 * 0,0 → 244,1 и не мигает лишним знаком.
 */
export type Stat = {
  id: "area" | "floor" | "ceiling" | "seats";
  value: number;
  decimals: number;
};

export const STATS: Stat[] = [
  { id: "area", value: 244.1, decimals: 1 },
  { id: "floor", value: 23, decimals: 0 },
  { id: "ceiling", value: 3.8, decimals: 1 },
  { id: "seats", value: 26, decimals: 0 },
];
