"use client";

import { useEffect } from "react";

/**
 * Точка входа второй части анимации. Сам компонент не рисует ничего и весит
 * ровно столько, сколько видно ниже: весь код эффектов лежит за динамическим
 * импортом и приезжает отдельным чанком.
 *
 * Момент запуска — готовность плавного скролла, а не собственный
 * requestIdleCallback. Так ScrollTrigger заведомо синхронизирован с Lenis
 * (иначе параллакс отстаёт на кадр и дребезжит), и так же заведомо всё
 * происходит после LCP: Lenis сам приезжает в простое.
 *
 * Запасной путь на случай, если плавный скролл не поднялся вовсе: через три
 * секунды запускаемся на нативном скролле. ScrollTrigger работает и так.
 *
 * Медиапризнаки читаются напрямую, без состояния React. Компоненту нечего
 * перерисовывать, а хук с состоянием дал бы лишний кадр, в котором эффекты
 * успели бы запуститься на телефоне до того, как состояние устоится.
 */
export function DesktopMotion() {
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 650px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let dispose: (() => void) | null = null;
    let starting = false;
    let cancelled = false;
    let timer: number | null = null;

    const allowed = () => wide.matches && !reduced.matches;

    const start = async () => {
      if (starting || dispose || !allowed()) return;
      starting = true;
      const { initDesktopMotion } = await import("@/lib/desktop");
      starting = false;
      if (cancelled || !allowed()) return;
      dispose = initDesktopMotion();
    };

    const stop = () => {
      dispose?.();
      dispose = null;
    };

    const onReady = () => void start();

    if (document.documentElement.dataset.smoothScroll === "on") {
      void start();
    } else {
      window.addEventListener("smooth-scroll-ready", onReady, { once: true });
      timer = window.setTimeout(() => void start(), 3000);
    }

    // Переход через брейкпоинт и переключение настройки движения обязаны
    // работать в обе стороны: эффекты снимаются, а слои возвращаются
    // в исходное состояние — это делают сами модули при выгрузке.
    const onChange = () => {
      if (allowed()) void start();
      else stop();
    };
    wide.addEventListener("change", onChange);
    reduced.addEventListener("change", onChange);

    return () => {
      cancelled = true;
      if (timer !== null) window.clearTimeout(timer);
      window.removeEventListener("smooth-scroll-ready", onReady);
      wide.removeEventListener("change", onChange);
      reduced.removeEventListener("change", onChange);
      stop();
    };
  }, []);

  return null;
}
