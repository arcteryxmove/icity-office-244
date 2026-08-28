"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { CONTACT_FORM_CLASS, ContactFields } from "@/components/sections/ContactFields";
import { validateLead, type LeadField } from "@/lib/lead";

type Status = "idle" | "sending" | "sent" | "failed";

/**
 * Остров формы. Всё поведение живёт здесь, разметка полей — в ContactFields,
 * общем с серверной заглушкой.
 *
 * Чего здесь нет и не будет: скрытого поля со временем начала заполнения.
 * В первой версии такая отсечка отправляла в форму ноль и рубила каждую
 * живую заявку — сайт при этом работал, а заявки не приходили.
 *
 * Двойное нажатие не создаёт вторую заявку: отправка закрыта и состоянием,
 * и ref-замком. Состояние перерисовывает кнопку, ref срабатывает в том же
 * такте, до перерисовки.
 */
export default function ContactForm() {
  const t = useTranslations("contact.form");
  const locale = useLocale();

  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Partial<Record<LeadField, boolean>>>({});
  const inFlight = useRef(false);
  const sent = useRef<HTMLDivElement>(null);

  /**
   * Успех забирает фокус. Без этого фокус оставался на кнопке, которой уже
   * нет в документе, то есть уходил на body: скринридер молчал, а следующий
   * Tab уводил не вперёд, а назад — на телефон над формой. Замерено.
   *
   * role="status" здесь дополняет, а не заменяет: блок появляется целиком,
   * а живой регион, созданный вместе со своим содержимым, читают не все
   * скринридеры. Озвучивание гарантирует именно фокус.
   */
  useEffect(() => {
    if (status === "sent") sent.current?.focus();
  }, [status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const lead = {
      name: String(data.get("name") ?? ""),
      contact: String(data.get("contact") ?? ""),
      message: String(data.get("message") ?? ""),
      locale,
    };

    const invalid = validateLead(lead);
    if (invalid.length > 0) {
      const next: Partial<Record<LeadField, boolean>> = {};
      for (const field of invalid) next[field] = true;
      setErrors(next);
      setStatus("idle");
      const first = form.elements.namedItem(invalid[0]);
      if (first instanceof HTMLElement) first.focus();
      return;
    }

    inFlight.current = true;
    setErrors({});
    setStatus("sending");

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(lead),
      });
      if (!response.ok) throw new Error(String(response.status));
      setStatus("sent");
      form.reset();
    } catch {
      // Текст заявки остаётся в полях: они неуправляемые, форму не сбрасываем.
      setStatus("failed");
    } finally {
      inFlight.current = false;
    }
  }

  if (status === "sent") {
    return (
      <div
        ref={sent}
        tabIndex={-1}
        role="status"
        className="rounded-card bg-sky p-[2.4rem] md:p-[3.2rem]"
      >
        <p className="text-[1.8rem] leading-[1.3] text-ink">{t("sentTitle")}</p>
        <p className="mt-[1.2rem] text-[1.5rem] leading-[1.5] text-slate">{t("sentNote")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={CONTACT_FORM_CLASS}>
      <ContactFields
        errors={errors}
        busy={status === "sending"}
        status={
          <p aria-live="polite" className="sr-only">
            {status === "sending" ? t("sending") : ""}
          </p>
        }
      />
      {status === "failed" ? (
        <p
          role="alert"
          className="flex items-start gap-[0.6rem] text-[1.4rem] leading-[1.35] text-error"
        >
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
          <span>{t("networkError")}</span>
        </p>
      ) : null}
    </form>
  );
}
