"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/**
 * Шапка. Прозрачная на hero, с фоном после прокрутки.
 *
 * Состояние ловится наблюдателем за точкой в самом верху документа, а не
 * обработчиком scroll: обработчик считался бы на каждый кадр Lenis, а нужно
 * ровно одно переключение. Переход по фону плавный, потому что меняется
 * прозрачность, а не наличие класса с фоном.
 *
 * Кнопки звука здесь нет намеренно: звука в проекте пока нет, а кнопка,
 * которая ничего не делает, хуже её отсутствия. Появится вместе со звуком.
 *
 * Остров сюда не подходит: шапка на первом экране и должна работать сразу.
 */
export function SiteHeader() {
  const t = useTranslations("header");
  const locale = useLocale();
  const pathname = usePathname();
  const sentinel = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const node = sentinel.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Точка отсчёта. Высота ненулевая, иначе наблюдатель не сработает. */}
      <div ref={sentinel} aria-hidden className="absolute top-0 left-0 h-[1px] w-full" />

      <header
        data-tone="sky"
        data-scrolled={scrolled || undefined}
        className="fixed inset-x-0 top-0 z-40"
      >
        {/* Фон отдельным слоем: анимируем прозрачность, а не переключаем
            класс — иначе фон появлялся бы скачком. */}
        <div
          aria-hidden
          style={{ opacity: scrolled ? 1 : 0 }}
          className="absolute inset-0 border-b border-hairline bg-sky/92 backdrop-blur-[8px] transition-opacity duration-[var(--duration-slow)] ease-ui"
        />

        <div className="container-page relative flex h-[6.4rem] items-center justify-between gap-[1.6rem] md:h-[7.2rem]">
          <a
            href="#hero"
            // Доступное имя начинается с видимого текста. Иначе WCAG 2.5.3
            // Label in Name: голосовое управление по команде «нажми iCITY»
            // на ссылку не попадает, а Lighthouse ловит это как
            // label-content-name-mismatch.
            aria-label={`${t("brand")} — ${t("toTop")}`}
            className="tabular text-[1.4rem] font-medium tracking-[0.02em] text-ink transition-colors duration-[var(--duration-ui)] ease-ui hover:text-azure focus-visible:outline-2 focus-visible:outline-offset-[4px] focus-visible:outline-azure md:text-[1.5rem]"
          >
            {t("brand")}
          </a>

          <div className="flex items-center gap-[1.6rem] md:gap-[2.4rem]">
            <nav aria-label={t("language")} className="flex items-center gap-[0.8rem]">
              {routing.locales.map((code) => {
                const current = code === locale;
                return (
                  <Link
                    key={code}
                    href={pathname}
                    locale={code}
                    // Без этого переход на другой язык бросает читателя
                    // наверх страницы.
                    scroll={false}
                    aria-current={current ? "true" : undefined}
                    className={
                      "text-[1.4rem] leading-none uppercase transition-colors duration-[var(--duration-ui)] ease-ui " +
                      "focus-visible:outline-2 focus-visible:outline-offset-[4px] focus-visible:outline-azure " +
                      (current
                        ? "font-medium text-ink"
                        : "text-slate hover:text-azure")
                    }
                  >
                    {code}
                  </Link>
                );
              })}
            </nav>

            <a
              href="#contact"
              data-magnetic=""
              className="hidden rounded-pill bg-azure px-[2rem] py-[1rem] text-[1.4rem] font-medium leading-none text-paper transition-colors duration-[var(--duration-ui)] ease-ui hover:bg-ink focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-ink md:inline-flex"
            >
              {t("cta")}
            </a>
          </div>
        </div>
      </header>
    </>
  );
}
