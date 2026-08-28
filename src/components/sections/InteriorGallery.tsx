"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type Ref,
} from "react";
import { useSmoothScroll } from "@/components/SmoothScrollProvider";
import { INTERIOR_SHOTS } from "@/content/interior";
import { Flip, gsap } from "@/lib/gsap";
import { cubicBezier, UI } from "@/lib/motion";
import { InteriorGrid } from "./InteriorGrid";

/** Кривая перелёта: симметричная, разгон и торможение одинаковые. */
const FLIP_EASE = cubicBezier(...UI.ease);
const FLIP_DURATION = 0.6;

/**
 * Галерея с переходом карточка → полный экран через GSAP Flip.
 *
 * Переход физически непрерывный: в просмотрщике живёт отдельный узел, он
 * мгновенно подгоняется под габарит плитки через Flip.fit, а потом летит
 * на своё место. Плитка на это время скрывается, поэтому кадр один, а не два.
 * Это не модалка: ничего не «всплывает», кадр едет оттуда, куда нажали.
 *
 * gsap и Flip приезжают вместе с этим чанком — на первый экран они не едут.
 */
export default function InteriorGallery() {
  const t = useTranslations("interior");
  const lenis = useSmoothScroll();

  const [open, setOpen] = useState<number | null>(null);
  const [flying, setFlying] = useState<number | null>(null);

  const thumbs = useRef<(HTMLDivElement | null)[]>([]);
  const full = useRef<HTMLDivElement>(null);
  const viewer = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const thumbRef = useCallback(
    (index: number): Ref<HTMLDivElement> =>
      (node) => {
        thumbs.current[index] = node;
      },
    [],
  );

  const reduced = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const openAt = (index: number) => {
    returnFocus.current = document.activeElement as HTMLElement | null;
    setFlying(index);
    setOpen(index);
  };

  const close = useCallback(() => {
    const node = full.current;
    const thumb = open !== null ? thumbs.current[open] : null;

    const finish = () => {
      setOpen(null);
      setFlying(null);
      returnFocus.current?.focus?.();
    };

    if (!node || !thumb || reduced()) {
      if (viewer.current && !reduced()) {
        gsap.to(viewer.current, { opacity: 0, duration: UI.duration, onComplete: finish });
        return;
      }
      finish();
      return;
    }

    gsap.to(viewer.current, { opacity: 0, duration: FLIP_DURATION, ease: FLIP_EASE });
    Flip.fit(node, thumb, {
      scale: true,
      duration: FLIP_DURATION,
      ease: FLIP_EASE,
      onComplete: finish,
    });
  }, [open]);

  // Перелёт плитки в полный экран.
  useLayoutEffect(() => {
    if (open === null) return;
    const node = full.current;
    const thumb = thumbs.current[open];
    if (!node) return;

    if (!thumb || reduced()) {
      // При выключенной анимации кадр просто проявляется.
      gsap.fromTo(viewer.current, { opacity: 0 }, { opacity: 1, duration: UI.duration });
      return;
    }

    // Ставим кадр ровно на плитку, запоминаем это состояние, возвращаем
    // на своё место и проигрываем путь обратно — получается непрерывный полёт.
    Flip.fit(node, thumb, { scale: true });
    const fromThumb = Flip.getState(node);
    gsap.set(node, { clearProps: "transform,width,height,top,left" });

    gsap.fromTo(viewer.current, { opacity: 0 }, { opacity: 1, duration: 0.25 });
    Flip.from(fromThumb, {
      duration: FLIP_DURATION,
      ease: FLIP_EASE,
      scale: true,
      onComplete: () => setFlying(null),
    });
    // Плитку прячем только на время полёта, дальше она не видна за оверлеем.
    setFlying(open);
  }, [open]);

  // Блокировка прокрутки: позиция сохраняется, потому что гасим overflow,
  // а не переносим тело в fixed.
  useEffect(() => {
    if (open === null) return;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    const { overflow, paddingRight } = document.body.style;
    document.body.style.overflow = "hidden";
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;
    // Признак для липкой панели: она прячется, пока кадр открыт.
    document.documentElement.dataset.viewer = "open";
    lenis?.stop();
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      delete document.documentElement.dataset.viewer;
      lenis?.start();
    };
  }, [open, lenis]);

  // Клавиатура: Escape закрывает, стрелки листают, Tab не убегает наружу.
  useEffect(() => {
    if (open === null) return;
    closeButton.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setOpen((cur) => (cur === null ? cur : (cur + 1) % INTERIOR_SHOTS.length));
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setOpen((cur) =>
          cur === null ? cur : (cur - 1 + INTERIOR_SHOTS.length) % INTERIOR_SHOTS.length,
        );
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = viewer.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  const current = open;
  const shot = current === null ? null : INTERIOR_SHOTS[current];
  const caption = shot ? t(`shots.${shot.id}` as never) : "";

  return (
    <>
      <InteriorGrid onOpen={openAt} thumbRef={thumbRef} hiddenIndex={flying ?? open} />

      {shot && current !== null ? (
        <div
          ref={viewer}
          role="dialog"
          aria-modal="true"
          aria-label={t("viewer")}
          data-tone="mist"
          className="fixed inset-0 z-50 flex flex-col bg-mist/98 p-[2rem] md:p-[3.2rem]"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div className="flex shrink-0 items-center justify-between gap-[1.6rem]">
            <span className="tabular text-[1.4rem] text-slate">
              {t("position", { current: (current ?? 0) + 1, total: INTERIOR_SHOTS.length })}
            </span>
            <button
              ref={closeButton}
              type="button"
              onClick={close}
              className="rounded-pill bg-ink px-[2.4rem] py-[1.2rem] text-[1.5rem] font-medium leading-none text-paper transition-colors duration-[var(--duration-ui)] ease-ui hover:bg-azure focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-azure"
            >
              {t("close")}
            </button>
          </div>

          {/* Кадр и подпись держатся вместе и центрируются: иначе на узком
              экране картинка висит одна посреди пустого поля. */}
          <div
            className="flex min-h-0 flex-1 flex-col items-center justify-center gap-[1.6rem] py-[2rem]"
            onPointerDown={(event) => {
              if (event.target === event.currentTarget) close();
            }}
          >
            {/* Бокс держит пропорцию кадра, поэтому Flip несёт ровно то,
                что видно: полей внутри бокса нет. */}
            <div
              ref={full}
              className="relative max-h-full w-full overflow-hidden rounded-image"
              style={{ aspectRatio: `${shot.width} / ${shot.height}` }}
            >
              <Image
                src={shot.src}
                alt={caption}
                fill
                sizes="92vw"
                quality={85}
                priority
                className="object-contain"
              />
            </div>

            <div className="flex w-full shrink-0 items-center justify-between gap-[2rem]">
              {/* Подпись под кадром, не поверх него. */}
              <p className="max-w-[62rem] text-[1.4rem] leading-[1.4] text-ink md:text-[1.5rem]">
                {caption}
              </p>
              <div className="flex shrink-0 gap-[1.2rem]">
                <button
                  type="button"
                  onClick={() =>
                    setOpen((cur) =>
                      cur === null ? cur : (cur - 1 + INTERIOR_SHOTS.length) % INTERIOR_SHOTS.length,
                    )
                  }
                  aria-label={t("prev")}
                  className="rounded-pill border border-hairline bg-paper px-[1.8rem] py-[1.2rem] text-[1.6rem] leading-none text-ink hover:border-azure hover:text-azure focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-azure"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setOpen((cur) => (cur === null ? cur : (cur + 1) % INTERIOR_SHOTS.length))
                  }
                  aria-label={t("next")}
                  className="rounded-pill border border-hairline bg-paper px-[1.8rem] py-[1.2rem] text-[1.6rem] leading-none text-ink hover:border-azure hover:text-azure focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-azure"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
