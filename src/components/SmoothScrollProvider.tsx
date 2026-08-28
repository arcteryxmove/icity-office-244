"use client";

import type Lenis from "lenis";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { SMOOTH_SCROLL } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const SmoothScrollContext = createContext<Lenis | null>(null);

/** Доступ к инстансу для якорных переходов и остановки скролла под оверлеем. */
export function useSmoothScroll(): Lenis | null {
  return useContext(SmoothScrollContext);
}

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    // При prefers-reduced-motion Lenis не инициализируется вообще:
    // не «с нулевой длительностью», а физически отсутствует, чтобы
    // нативный скролл и системные переходы по якорям работали как есть.
    if (reducedMotion) return;

    let cancelled = false;
    let instance: Lenis | null = null;
    let onScroll: (() => void) | null = null;
    let raf: ((time: number) => void) | null = null;
    let lib: typeof import("@/lib/gsap") | null = null;

    // Lenis и GSAP грузятся в простое после гидратации, а не по первому
    // жесту. Ожидание жеста стоило слишком дорого: первый жест — это первое,
    // что человек делает на сайте, и он всегда уходил нативно, то есть
    // плавного скролла фактически не было ни у кого.
    //
    // requestIdleCallback наступает после LCP, поэтому первый экран не
    // тяжелеет: чанк с gsap не участвует в критическом пути, он приезжает,
    // когда браузеру нечем заняться.
    const start = async () => {
      const [{ default: LenisCtor }, gsapLib] = await Promise.all([
        import("lenis"),
        import("@/lib/gsap"),
      ]);
      if (cancelled) return;

      lib = gsapLib;
      instance = new LenisCtor({
        lerp: SMOOTH_SCROLL.lerp,
        // Тач оставляем нативным: инерция iOS лучше любой эмуляции,
        // а половина заявок придёт с телефона.
        smoothWheel: true,
        syncTouch: false,
      });
      setLenis(instance);

      // ScrollTrigger должен пересчитываться в том же кадре, что и Lenis,
      // иначе пины и параллакс отстают на кадр и заметно дребезжат.
      onScroll = () => gsapLib.ScrollTrigger.update();
      instance.on("scroll", onScroll);

      raf = (time: number) => instance?.raf(time * 1000);
      gsapLib.gsap.ticker.add(raf);
      // Тикер GSAP становится единственным источником кадров;
      // сглаживание лагов при этом только мешает.
      gsapLib.gsap.ticker.lagSmoothing(0);

      // Признак готовности: по нему замеряется время до плавного скролла
      // и по нему же можно цеплять поведение, которому нужен GSAP.
      document.documentElement.dataset.smoothScroll = "on";
      window.dispatchEvent(new Event("smooth-scroll-ready"));
    };

    // Простой браузера: в Safari requestIdleCallback до сих пор нет,
    // поэтому запасной путь — таймер на 2000 мс. Оба варианта одноразовые.
    let idle: number | null = null;
    let timer: number | null = null;

    if (typeof window.requestIdleCallback === "function") {
      idle = window.requestIdleCallback(() => void start(), { timeout: 2000 });
    } else {
      timer = window.setTimeout(() => void start(), 2000);
    }

    return () => {
      if (idle !== null && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idle);
      }
      if (timer !== null) window.clearTimeout(timer);
      cancelled = true;
      if (instance && onScroll) instance.off("scroll", onScroll);
      if (lib && raf) {
        lib.gsap.ticker.remove(raf);
        lib.gsap.ticker.lagSmoothing(500, 33);
      }
      instance?.destroy();
      delete document.documentElement.dataset.smoothScroll;
      setLenis(null);
    };
  }, [reducedMotion]);

  return (
    <SmoothScrollContext.Provider value={lenis}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
