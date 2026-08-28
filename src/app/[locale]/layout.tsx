import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { DesktopMotion } from "@/components/DesktopMotion";
import { HeadingMotion } from "@/components/HeadingMotion";
import { SiteHeader } from "@/components/SiteHeader";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { StickyCta } from "@/components/StickyCta";
import { routing } from "@/i18n/routing";
import { localePath, SITE_URL } from "@/lib/site";
import "../globals.css";

const FONT_PRELOAD = [
  "/fonts/unbounded-cyrillic.woff2",
  "/fonts/unbounded-latin.woff2",
  "/fonts/unbounded-ruble.woff2",
  "/fonts/onest-cyrillic.woff2",
  "/fonts/onest-latin.woff2",
  "/fonts/onest-ruble.woff2",
];

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/** Языковые метки для og. Ключи — те же локали, что в routing. */
const OG_LOCALE: Record<string, string> = { ru: "ru_RU", en: "en_US" };

export async function generateMetadata({
  params,
}: Omit<LayoutProps, "children">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  const title = t("title");
  const description = t("description");

  // hreflang уже уходит HTTP-заголовком Link от next-intl. Теги в <head>
  // добавлены не вместо него, а рядом: заголовок теряется, если страницу
  // отдаст не наш сервер — прокси, кэш, сохранённая копия.
  const languages = Object.fromEntries(
    routing.locales.map((code) => [code, localePath(code)]),
  );

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: {
      canonical: localePath(locale),
      languages: { ...languages, "x-default": localePath(routing.defaultLocale) },
    },
    // og:title и og:description — те же строки, что в title и description.
    // Второй набор текстов про один объект разошёлся бы при первой правке.
    openGraph: {
      type: "website",
      url: localePath(locale),
      title,
      description,
      locale: OG_LOCALE[locale],
      alternateLocale: routing.locales.filter((c) => c !== locale).map((c) => OG_LOCALE[c]),
      images: [
        {
          url: `/og/${locale}.png`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/og/${locale}.png`],
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "32x32" },
        { url: "/icon-32.png", type: "image/png", sizes: "32x32" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    },
    manifest: "/site.webmanifest",
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Без этого страница уходит в динамический рендер целиком.
  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <head>
        {/* Предзагружаем ровно те шесть файлов, что нужны первому экрану.
            crossOrigin обязателен даже для своего домена: без него запрос
            предзагрузки и запрос шрифта не совпадут и файл уедет дважды. */}
        {FONT_PRELOAD.map((href) => (
          <link
            key={href}
            rel="preload"
            href={href}
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
        ))}
      </head>
      <body>
        <NextIntlClientProvider>
          <SmoothScrollProvider>
            <SiteHeader />
            {children}
            <HeadingMotion />
            <DesktopMotion />
            <StickyCta />
          </SmoothScrollProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
