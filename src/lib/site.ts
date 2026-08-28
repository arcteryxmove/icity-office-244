/**
 * Базовый адрес сайта. Нужен трём вещам сразу: канонической ссылке,
 * абсолютным адресам в og и sitemap.xml. Все три обязаны указывать на один
 * и тот же домен, поэтому источник один.
 *
 * Домен продакшена в брифе не назван. Пока его нет, адрес берётся из
 * NEXT_PUBLIC_SITE_URL, а на Vercel — из имени проекта. Локальная сборка
 * падает на localhost: так видно, что домен не задан, а не подставлен
 * молча выдуманный.
 */
const LOCAL = "http://localhost:3000";

function resolve(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;

  return LOCAL;
}

export const SITE_URL = resolve();

/** Адрес страницы локали. Ведущий слэш обязателен: он же ключ hreflang. */
export function localePath(locale: string): string {
  return `/${locale}`;
}
