import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { localePath, SITE_URL } from "@/lib/site";

/**
 * Две страницы, по одной на локаль, и перекрёстные hreflang между ними.
 * Русская — основная: она же x-default и она же цель редиректа с корня.
 *
 * lastModified — время сборки. Это честная дата: страница статическая и
 * меняется ровно тогда, когда её пересобирают.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const builtAt = new Date();

  const languages = Object.fromEntries(
    routing.locales.map((locale) => [locale, `${SITE_URL}${localePath(locale)}`]),
  );

  return routing.locales.map((locale) => ({
    url: `${SITE_URL}${localePath(locale)}`,
    lastModified: builtAt,
    changeFrequency: "monthly",
    priority: locale === routing.defaultLocale ? 1 : 0.8,
    alternates: {
      languages: { ...languages, "x-default": `${SITE_URL}${localePath(routing.defaultLocale)}` },
    },
  }));
}
