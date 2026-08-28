import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

/**
 * Обработчик заявки закрыт от обхода: индексировать там нечего, а POST-адрес
 * в выдаче не нужен. Всё остальное открыто — страница одна на локаль.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/api/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
