"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { useSmoothScroll } from "@/components/SmoothScrollProvider";

const PHONE_HREF = "tel:+79093798015";

/**
 * Липкая панель, только мобильный.
 *
 * Появляется, когда hero ушёл наверх, и держится до конца страницы. Запас
 * под её высоту даёт футер отдельным блоком: панель висит поверх, и без
 * запаса она накрыла бы последнюю строку.
 *
 * При открытом полноэкранном кадре галереи панель скрывается — галерея
 * ставит на корень data-viewer, правило лежит в globals.css рядом с
 * остальным поведением оверлея.
 */
export function StickyCta() {
  const t = useTranslations("sticky");
  const lenis = useSmoothScroll();
  const [shown, setShown] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setShown(entry.boundingClientRect.bottom <= 0),
      { threshold: 0 },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
  }, []);

  function book() {
    const target = document.getElementById("contact");
    if (!target) return;

    if (lenis) lenis.scrollTo(target, { offset: -80 });
    else target.scrollIntoView({ behavior: "smooth", block: "start" });

    // Поле принадлежит острову формы: до его приезда фокусировать нечего,
    // поэтому ждём появления, а не хватаем сразу. Ожидание конечное.
    const started = Date.now();
    const tryFocus = () => {
      const field = document.getElementById("lead-name");
      if (field) {
        field.focus({ preventScroll: true });
        return;
      }
      if (Date.now() - started > 4000) return;
      timer.current = window.setTimeout(tryFocus, 120);
    };
    timer.current = window.setTimeout(tryFocus, 500);
  }

  return (
    <div
      data-sticky-cta
      data-shown={shown || undefined}
      className={
        "fixed inset-x-0 bottom-0 z-30 flex gap-[1.2rem] border-t border-hairline " +
        "bg-paper px-[2rem] py-[1.2rem] transition-transform duration-[var(--duration-ui)] ease-ui md:hidden " +
        (shown ? "translate-y-0" : "translate-y-full")
      }
      // Пока панель уехала вниз, её кнопки не должны ловить фокус.
      inert={!shown || undefined}
    >
      <a
        href={PHONE_HREF}
        className="flex flex-1 items-center justify-center rounded-pill border border-mist px-[1.6rem] py-[1.3rem] text-[1.5rem] font-medium leading-none text-ink focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-azure"
      >
        {t("call")}
      </a>
      <button
        type="button"
        onClick={book}
        className="flex flex-1 items-center justify-center rounded-pill bg-azure px-[1.6rem] py-[1.3rem] text-[1.5rem] font-medium leading-none text-paper focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-ink"
      >
        {t("book")}
      </button>
    </div>
  );
}
