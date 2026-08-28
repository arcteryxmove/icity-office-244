import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { LEAD_LIMITS, type LeadField } from "@/lib/lead";

/**
 * Поля формы. Директивы `use client` здесь нет намеренно: один и тот же
 * компонент рисует и серверную заглушку, и остров, поэтому геометрия
 * совпадает до пикселя и подмена не двигает вёрстку.
 *
 * Поля неуправляемые. Значения живут в DOM, а не в состоянии React, и
 * поэтому переживают неудачную отправку сами собой: при ошибке сети
 * перерисовывается только статус, текст заявки остаётся на месте.
 */
export const CONTACT_FORM_CLASS = "flex flex-col gap-[2rem]";

const FIELD_BASE =
  "w-full rounded-field bg-paper px-[1.8rem] py-[1.4rem] " +
  "text-[1.6rem] leading-[1.4] text-ink " +
  "focus-visible:outline-2 focus-visible:outline-offset-[2px] focus-visible:outline-azure";

/**
 * Цвет рамки подставляется, а не наслаивается. Две утилиты border-* с
 * одинаковой специфичностью разрешаются порядком в готовом CSS, а не
 * порядком в строке класса: при `border-mist border-error` побеждала mist,
 * и рамка ошибки оставалась голубой. Замерено в браузере, по коду не видно.
 */
const FIELD_CLASS = `${FIELD_BASE} border border-mist`;
const FIELD_INVALID_CLASS = `${FIELD_BASE} border-2 border-error`;

type ContactFieldsProps = {
  errors?: Partial<Record<LeadField, boolean>>;
  busy?: boolean;
  /** Область статуса под кнопкой. Рисует остров, у заглушки её нет. */
  status?: ReactNode;
};

function ErrorLine({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="flex items-start gap-[0.6rem] text-[1.4rem] leading-[1.35] text-error">
      {/* Иконка обязательна: цвет не бывает единственным признаком ошибки. */}
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className="mt-[0.2rem] h-[1.5rem] w-[1.5rem] shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="8" cy="8" r="6.4" />
        <path d="M8 4.6v4.2" strokeLinecap="round" />
        <path d="M8 11.3v.1" strokeLinecap="round" />
      </svg>
      <span>{children}</span>
    </p>
  );
}

export function ContactFields({ errors, busy = false, status }: ContactFieldsProps) {
  const t = useTranslations("contact.form");

  return (
    <>
      <div className="flex flex-col gap-[0.8rem]">
        <label htmlFor="lead-name" className="text-[1.4rem] font-medium text-ink">
          {t("name")}
        </label>
        <input
          id="lead-name"
          name="name"
          type="text"
          required
          maxLength={LEAD_LIMITS.name}
          autoComplete="name"
          disabled={busy}
          aria-invalid={errors?.name ? true : undefined}
          aria-describedby={errors?.name ? "lead-name-error" : undefined}
          className={errors?.name ? FIELD_INVALID_CLASS : FIELD_CLASS}
        />
        {errors?.name ? <ErrorLine id="lead-name-error">{t("nameError")}</ErrorLine> : null}
      </div>

      <div className="flex flex-col gap-[0.8rem]">
        <label htmlFor="lead-contact" className="text-[1.4rem] font-medium text-ink">
          {t("contact")}
        </label>
        <input
          id="lead-contact"
          name="contact"
          type="text"
          required
          maxLength={LEAD_LIMITS.contact}
          disabled={busy}
          aria-invalid={errors?.contact ? true : undefined}
          aria-describedby={errors?.contact ? "lead-contact-error" : undefined}
          className={errors?.contact ? FIELD_INVALID_CLASS : FIELD_CLASS}
        />
        {errors?.contact ? <ErrorLine id="lead-contact-error">{t("contactError")}</ErrorLine> : null}
      </div>

      <div className="flex flex-col gap-[0.8rem]">
        <label htmlFor="lead-message" className="text-[1.4rem] font-medium text-ink">
          {t("message")}
          <span className="ml-[0.6rem] font-normal text-slate">{t("optional")}</span>
        </label>
        <textarea
          id="lead-message"
          name="message"
          rows={3}
          maxLength={LEAD_LIMITS.message}
          disabled={busy}
          className={`${FIELD_CLASS} resize-y`}
        />
      </div>

      <div className="flex flex-col gap-[1.2rem]">
        <button
          type="submit"
          data-magnetic=""
          disabled={busy}
          aria-busy={busy || undefined}
          className={
            "inline-flex w-full items-center justify-center self-start rounded-pill bg-azure " +
            "px-[2.4rem] py-[1.4rem] md:w-auto " +
            "text-[1.6rem] font-medium leading-none text-paper " +
            "transition-colors duration-[var(--duration-ui)] ease-ui hover:bg-ink " +
            "focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-ink " +
            "disabled:pointer-events-none disabled:opacity-60"
          }
        >
          {busy ? t("sending") : t("submit")}
        </button>
        {status}
        <p className="text-[1.3rem] leading-[1.4] text-slate">{t("consent")}</p>
      </div>
    </>
  );
}
