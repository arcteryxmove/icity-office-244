/**
 * Заявка с формы: типы и проверка, общие для клиента и сервера.
 *
 * Одна и та же функция вызывается в браузере — чтобы человек увидел ошибку
 * сразу, — и в обработчике маршрута, потому что запрос может прийти мимо
 * формы. Разъезда правил между двумя проверками быть не должно, поэтому
 * файл один и в нём нет ни одной клиентской зависимости.
 *
 * Отсечки по времени заполнения здесь нет и не будет: в первой версии
 * такая отсечка рубила каждую живую заявку, и это записано в брифе как
 * класс бага с молчаливым отказом.
 */
export type LeadField = "name" | "contact";

export type Lead = {
  name: string;
  contact: string;
  message: string;
  locale: string;
};

export const LEAD_LIMITS = {
  name: 80,
  contact: 120,
  message: 1000,
} as const;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Телефон считаем валидным по числу цифр: маску не навязываем. */
const MIN_PHONE_DIGITS = 10;

export function validateLead(input: { name: string; contact: string }): LeadField[] {
  const errors: LeadField[] = [];

  if (input.name.trim().length < 2) errors.push("name");

  const contact = input.contact.trim();
  const digits = contact.replace(/\D/g, "").length;
  if (!(EMAIL.test(contact) || digits >= MIN_PHONE_DIGITS)) errors.push("contact");

  return errors;
}

/** Время по Москве — то, в котором управляющая перезванивает. */
export function moscowTime(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Europe/Moscow",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function leadToText(lead: Lead, at: Date): string {
  const lines = [
    "Заявка на просмотр — iCITY, 113Н",
    "",
    `Имя: ${lead.name.trim()}`,
    `Контакт: ${lead.contact.trim()}`,
  ];

  const message = lead.message.trim();
  if (message) lines.push(`Комментарий: ${message}`);

  lines.push("", `Язык страницы: ${lead.locale}`, `Время (МСК): ${moscowTime(at)}`);

  return lines.join("\n");
}
