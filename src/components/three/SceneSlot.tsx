"use client";

import { useTranslations } from "next-intl";
import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { SceneErrorBoundary } from "./SceneErrorBoundary";
import { supportsWebGL } from "./webgl";
import type { SceneContract, SceneSlotProps } from "./types";
import { cn } from "@/lib/cn";

type SceneSlotHarnessProps = SceneSlotProps & {
  /** Уже обёрнутый в dynamic(..., { ssr: false }) компонент сцены. */
  scene: ComponentType<SceneContract>;
  /** Описание для скринридера: холст сам по себе для него пустой. */
  label: string;
  /** Статичный вариант: нет WebGL, сцена упала, слот выключен. */
  fallback: ReactNode;
  /** Не дождались готовности — уходим в fallback, а не держим спиннер. */
  timeoutMs?: number;
  /** Простой вне вьюпорта, после которого сцена выгружается и отдаёт видеопамять. */
  unloadDelayMs?: number;
  /** Мобильный, prefers-reduced-motion, отключено замером — сюда. */
  disabled?: boolean;
};

/**
 * Обвязка слота. Одна на все три сцены: ленивая загрузка, Suspense,
 * прогресс, ошибка, выгрузка видеопамяти при уходе из вьюпорта, fallback
 * без WebGL. Партнёр меняет только содержимое сцены.
 */
export function SceneSlot({
  scene: Scene,
  label,
  fallback,
  timeoutMs,
  unloadDelayMs = 5000,
  disabled = false,
  active: activeProp,
  onReady,
  onProgress,
  onError,
  className,
}: SceneSlotHarnessProps) {
  const t = useTranslations("ui");
  const containerRef = useRef<HTMLDivElement>(null);

  const [webglReady, setWebglReady] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  // Проверяем WebGL после монтирования: на сервере ответа нет, а разметка
  // должна совпасть, иначе React перерисует блок и мигнёт.
  useEffect(() => {
    setWebglReady(supportsWebGL());
  }, []);

  // active из пропа главнее: сценой может управлять родитель (интро, тур).
  const active = activeProp ?? visible;

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "200px 0px", threshold: 0.01 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Монтируем сразу, размонтируем с задержкой: при быстром скролле мимо
  // секции пересоздавать контекст дороже, чем подождать пять секунд.
  useEffect(() => {
    if (disabled || webglReady !== true) {
      setMounted(false);
      return;
    }

    if (active) {
      setMounted(true);
      return;
    }

    const timer = window.setTimeout(() => {
      setMounted(false);
      setReady(false);
      setProgress(0);
    }, unloadDelayMs);

    return () => window.clearTimeout(timer);
  }, [active, disabled, webglReady, unloadDelayMs]);

  const handleError = useCallback(
    (error: Error) => {
      setFailed(true);
      setMounted(false);
      onError?.(error);
    },
    [onError],
  );

  // Жёсткий таймаут. Для интро он обязателен: не загрузилось — уходим на сайт.
  useEffect(() => {
    if (!timeoutMs || !mounted || ready || failed) return;

    const timer = window.setTimeout(() => {
      handleError(new Error(`Сцена «${label}» не готова за ${timeoutMs} мс`));
    }, timeoutMs);

    return () => window.clearTimeout(timer);
  }, [timeoutMs, mounted, ready, failed, handleError, label]);

  const handleReady = useCallback(() => {
    setReady(true);
    setProgress(100);
    onReady?.();
  }, [onReady]);

  const handleProgress = useCallback(
    (percent: number) => {
      setProgress(percent);
      onProgress?.(percent);
    },
    [onProgress],
  );

  const showFallback = failed || disabled || webglReady === false;
  const showLoader = mounted && !ready && !failed;

  return (
    <div
      ref={containerRef}
      className={cn("relative isolate h-full w-full overflow-hidden", className)}
      data-scene={label}
      data-scene-state={
        failed ? "error" : ready ? "ready" : mounted ? "loading" : "idle"
      }
    >
      {showFallback ? (
        <div className="h-full w-full" aria-label={label}>
          {fallback}
        </div>
      ) : null}

      {mounted && !failed ? (
        <SceneErrorBoundary fallback={fallback} onError={handleError}>
          <Suspense fallback={null}>
            <Scene
              active={active}
              onReady={handleReady}
              onProgress={handleProgress}
              onError={handleError}
            />
          </Suspense>
        </SceneErrorBoundary>
      ) : null}

      {showLoader ? (
        <div
          className="absolute inset-0 z-10 flex items-end justify-start p-[2rem]"
          role="status"
          aria-live="polite"
        >
          <div className="flex w-[16rem] flex-col gap-[0.8rem]">
            <span className="font-body text-[1.2rem] font-medium uppercase tracked-wide text-slate">
              {t("loading")}
            </span>
            <span className="block h-[2px] w-full bg-mist" aria-hidden>
              <span
                className="block h-full bg-azure transition-[width] duration-[var(--duration-ui)] ease-ui"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </span>
          </div>
        </div>
      ) : null}

      <span className="sr-only">
        {webglReady === false ? t("sceneUnsupported") : null}
        {failed ? t("sceneError") : null}
      </span>
    </div>
  );
}
