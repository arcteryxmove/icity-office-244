/**
 * Разряды разделяются неразрывным пробелом: иначе «1 300 000 ₽» рвётся
 * переносом посреди суммы, и человек читает «1» на одной строке.
 * Формат один для обеих локалей — цена в рублях не переводится.
 */
const RUB = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });

export function formatRub(value: number): string {
  return RUB.format(value).replace(/[\s\u202F\u00A0]/g, "\u00A0");
}
