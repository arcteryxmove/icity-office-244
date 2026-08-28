import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ru", "en"],
  defaultLocale: "ru",
  // 'always' — корень отдаёт редирект на /ru. Русский по умолчанию, но
  // без префикса не живёт: две одинаковые страницы по разным адресам
  // ломают канонические ссылки.
  localePrefix: "always",
  // Определять язык по Accept-Language не даём: объект московский,
  // дефолт русский, а не «как настроен браузер».
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
