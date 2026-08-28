/**
 * Факты секции 08. Числа те же, что в разделе «Объект»: этаж, потолок,
 * число сторон остекления. Ничего выведенного или округлённого.
 */
export type ViewFact = {
  id: "floor" | "ceiling" | "sides";
  value: number;
  decimals: number;
};

export const VIEW_FACTS: ViewFact[] = [
  { id: "floor", value: 23, decimals: 0 },
  { id: "ceiling", value: 3.8, decimals: 1 },
  { id: "sides", value: 2, decimals: 0 },
];
