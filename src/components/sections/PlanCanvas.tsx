"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { PLAN_COLUMNS, PLAN_VIEWBOX, PLAN_ZONES } from "@/content/planZones";
import { cn } from "@/lib/cn";
import { PlanFrame } from "./PlanFrame";

/**
 * Растровая подложка плюс SVG-слой зон поверх неё.
 *
 * Приезжает островом: сам план и все обработчики нужны только тогда, когда
 * человек до секции 06 дошёл. Оправу и подпись рисует серверная заглушка,
 * поэтому подмена не двигает вёрстку.
 *
 * Подложка и слой делят одну систему координат: контейнер держит точное
 * соотношение растра, картинка идёт object-contain, у svg тот же viewBox.
 * Поэтому координаты зон — прямо пиксели растра, без пересчётов.
 *
 * Подписи никогда не ложатся на план: активная зона называется в строке
 * под ним.
 *
 * Клавиатура. Пока план шире экрана, прокрутчик сам встаёт в порядок обхода
 * и получает роль и имя: без этого с клавиатуры был виден только левый край
 * чертежа — на 390 это 59% ширины, остальные 530px недостижимы. Стрелки
 * панорамируют, Home и End бросают к краям, а фокус на зоне подкручивает
 * контейнер так, чтобы зона попала в кадр целиком.
 */

/** Доля видимой ширины за одно нажатие стрелки. */
const PAN_STEP = 0.18;
/** Отступ, на который зона отодвигается от края кадра. */
const PAN_PAD = 24;

export default function PlanCanvas() {
  const t = useTranslations("plan");
  const [active, setActive] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [pannable, setPannable] = useState(false);
  const reduced = useReducedMotion();
  const behavior: ScrollBehavior = reduced ? "auto" : "smooth";

  // Прокрутчик нужен только там, где план не помещается: с 1275px контейнер
  // становится overflow-visible, и лишняя остановка Tab была бы мусором.
  useEffect(() => {
    const node = scroller.current;
    if (!node) return;
    const check = () => setPannable(node.scrollWidth - node.clientWidth > 1);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const pan = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const node = scroller.current;
      if (!node || node.scrollWidth <= node.clientWidth) return;
      const step = node.clientWidth * PAN_STEP;

      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        node.scrollBy({ left: event.key === "ArrowRight" ? step : -step, behavior });
        return;
      }
      if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        node.scrollTo({ left: event.key === "Home" ? 0 : node.scrollWidth, behavior });
      }
    },
    [behavior],
  );

  /** Подкрутить кадр так, чтобы зона в фокусе была видна целиком. */
  const reveal = useCallback(
    (element: SVGGElement) => {
      const node = scroller.current;
      if (!node || node.scrollWidth <= node.clientWidth) return;
      const zone = element.getBoundingClientRect();
      const frame = node.getBoundingClientRect();

      let shift = 0;
      if (zone.width > frame.width - PAN_PAD * 2) {
        // Зона шире кадра — показываем её начало, иначе кадр дёргался бы.
        shift = zone.left - frame.left - PAN_PAD;
      } else if (zone.left < frame.left + PAN_PAD) {
        shift = zone.left - frame.left - PAN_PAD;
      } else if (zone.right > frame.right - PAN_PAD) {
        shift = zone.right - frame.right + PAN_PAD;
      }
      if (shift !== 0) node.scrollBy({ left: shift, behavior });
    },
    [behavior],
  );

  const label = useCallback(
    (id: string) => {
      const zone = PLAN_ZONES.find((z) => z.id === id);
      const name = t(`zones.${id}` as never);
      return zone && zone.seats > 0
        ? `${name} · ${t("seats", { count: zone.seats })}`
        : name;
    },
    [t],
  );

  const clear = useCallback(() => setActive(null), []);

  return (
    <div onPointerLeave={clear}>
      <PlanFrame
        caption={active ? label(active) : t("hint")}
        captionStrong={Boolean(active)}
        scrollerRef={scroller}
        scrollerProps={{
          onKeyDown: pan,
          ...(pannable
            ? { tabIndex: 0, role: "region", "aria-label": t("scrollRegion") }
            : {}),
        }}
      >
        <Image
          src="/plan/plan-113n.webp"
          alt={t("imageAlt")}
          fill
          // sizes занижены намеренно. По честной ширине контейнера при DPR 3
          // браузер выбирал вариант 3840px — 300 КБ на штриховой чертёж.
          // Эти значения удерживают выбор на 2048px: 201 КБ и та же
          // читаемость, разница на глаз не видна.
          sizes="(min-width: 1275px) 71vw, (min-width: 650px) 66vw, 680px"
          quality={85}
          className="object-contain"
        />

        <svg
          viewBox={`0 0 ${PLAN_VIEWBOX.w} ${PLAN_VIEWBOX.h}`}
          className="absolute inset-0 h-full w-full"
          role="group"
          aria-label={t("svgLabel")}
        >
          <defs>
            {/* Колонны вырезаются из любой заливки: зона не должна их
                проглатывать. Маска на попадание указателя не влияет —
                дырка только в картинке, наводиться на зону можно и там. */}
            <mask id="plan-columns">
              <rect width={PLAN_VIEWBOX.w} height={PLAN_VIEWBOX.h} fill="white" />
              {PLAN_COLUMNS.map((c) => (
                <circle key={`${c.x}-${c.y}`} cx={c.x} cy={c.y} r={c.r} fill="black" />
              ))}
            </mask>
          </defs>

          {PLAN_ZONES.map((zone) => {
            const on = active === zone.id;
            const common = {
              role: "button" as const,
              tabIndex: 0,
              "aria-label": label(zone.id),
              "aria-pressed": on,
              className: "cursor-pointer focus:outline-none",
              onPointerEnter: (e: React.PointerEvent) => {
                if (e.pointerType === "mouse") setActive(zone.id);
              },
              onClick: () => setActive((cur) => (cur === zone.id ? null : zone.id)),
              onFocus: (e: React.FocusEvent<SVGGElement>) => {
                setActive(zone.id);
                reveal(e.currentTarget);
              },
              onBlur: clear,
              onKeyDown: (e: React.KeyboardEvent) => {
                if (e.key === "Escape") clear();
              },
            };

            if (zone.shape.kind === "point") {
              const { x, y } = zone.shape;
              return (
                <g key={zone.id} {...common}>
                  {/* Зона попадания заметно больше точки: на 390 радиус 70
                      давал цель 30px, меньше пальца. */}
                  <circle cx={x} cy={y} r={120} fill="transparent" />
                  <circle
                    cx={x}
                    cy={y}
                    r={on ? 46 : 30}
                    className={cn(
                      "transition-all duration-[var(--duration-ui)] ease-ui",
                      on ? "fill-azure" : "fill-slate/60",
                    )}
                  />
                </g>
              );
            }

            const { x, y, w, h } = zone.shape;
            return (
              <g key={zone.id} {...common}>
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  mask="url(#plan-columns)"
                  className={cn(
                    "transition-opacity duration-[var(--duration-ui)] ease-ui fill-azure",
                    on ? "opacity-[0.22]" : "opacity-0",
                  )}
                />
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  fill="none"
                  strokeWidth={10}
                  className={cn(
                    "transition-opacity duration-[var(--duration-ui)] ease-ui stroke-azure",
                    on ? "opacity-100" : "opacity-0",
                  )}
                />
              </g>
            );
          })}
        </svg>
      </PlanFrame>
    </div>
  );
}
