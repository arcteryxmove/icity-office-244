/**
 * Условия аренды. Все числа — из раздела «Объект» в CLAUDE.md.
 *
 * Депозит и первый платёж выведены из ставки, а не вписаны отдельно:
 * так они не разъедутся, если ставка когда-нибудь изменится.
 *
 * Индексации ставки в брифе нет — строки про неё в таблице нет вовсе,
 * прочерк тоже не ставим.
 */
export const RENT = {
  /** ₽ в месяц. */
  monthly: 1_300_000,
  /** Депозит два месяца → 2 600 000 ₽. */
  depositMonths: 2,
  minTerm: 11,
  maxTerm: 60,
  defaultTerm: 12,
} as const;

/** 2 × 1 300 000 = 2 600 000 ₽ */
export const DEPOSIT = RENT.monthly * RENT.depositMonths;

/** 1 300 000 + 2 600 000 = 3 900 000 ₽ */
export const FIRST_MONTH = RENT.monthly + DEPOSIT;

/** Порядок строк таблицы. Он же порядок в разметке. */
export const TERM_ROWS = [
  "rate",
  "perSqm",
  "service",
  "vat",
  "utilities",
  "deposit",
  "minTerm",
  "furniture",
  "layout",
] as const;
