import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // three и drei поставляются в ESM и тянут воркеры — транспилируем явно.
  transpilePackages: ["three"],
  images: {
    // AVIF первым, WebP запасным. Порядок здесь — это порядок предпочтения:
    // next/image отдаёт первый формат, который браузер принял по Accept, а
    // тот, кто не принял ни одного, получит исходный PNG. Замерено на
    // hero-кадре при w=1440 q=85: AVIF 47.0 КБ против WebP 102.6 КБ, минус
    // 55.6 КБ на критическом пути LCP.
    formats: ["image/avif", "image/webp"],
    // 1440 добавлен намеренно: на десктопе кадр hero занимает 720 CSS-пикселей,
    // при DPR 2 нужно ровно 1440, а ближайшим сверху был 1920 — лишние 28 КБ
    // на критическом пути LCP.
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920, 2048, 3840],
    // Начиная с Next 16 качество, не перечисленное здесь, будет ошибкой,
    // а не предупреждением. Сейчас в проекте одно значение — 85.
    qualities: [85],
  },
};

export default withNextIntl(nextConfig);
