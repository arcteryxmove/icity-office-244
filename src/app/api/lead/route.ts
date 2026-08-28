import { NextResponse } from "next/server";

import { LEAD_LIMITS, leadToText, validateLead, type Lead } from "@/lib/lead";

/**
 * Приём заявки и отправка в Telegram.
 *
 * Токен читается из окружения при каждом запросе и в код не попадает.
 * Ответ Telegram наружу не пересказывается: клиент узнаёт только «дошло»
 * или «не дошло», иначе в браузер утечёт устройство интеграции.
 *
 * Обработчик принимает два формата тела. JSON — это остров формы. Обычная
 * форма — это окно до гидратации: пока чанк с островом не приехал, кнопка
 * отправляет форму нативно, заявка всё равно доходит, а человек
 * возвращается на страницу с якорем #contact-sent.
 */
const TELEGRAM_TIMEOUT_MS = 10_000;

function clamp(value: unknown, limit: number): string {
  return typeof value === "string" ? value.slice(0, limit) : "";
}

async function send(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error("lead: TELEGRAM_TOKEN или TELEGRAM_CHAT_ID не заданы");
    return false;
  }

  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), TELEGRAM_TIMEOUT_MS);

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      // parse_mode не задаём намеренно: в обычном тексте не нужно
      // экранировать то, что человек написал в комментарии.
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      signal: abort.signal,
    });

    if (!response.ok) {
      console.error("lead: Telegram ответил", response.status);
      return false;
    }

    const data = (await response.json()) as { ok?: boolean };
    return data.ok === true;
  } catch (error) {
    console.error("lead: отправка не удалась", error);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const isForm = !contentType.includes("application/json");

  let raw: Record<string, unknown> = {};
  try {
    if (isForm) {
      const form = await request.formData();
      raw = Object.fromEntries(form.entries());
    } else {
      raw = (await request.json()) as Record<string, unknown>;
    }
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const lead: Lead = {
    name: clamp(raw.name, LEAD_LIMITS.name),
    contact: clamp(raw.contact, LEAD_LIMITS.contact),
    message: clamp(raw.message, LEAD_LIMITS.message),
    locale: raw.locale === "en" ? "en" : "ru",
  };

  if (validateLead(lead).length > 0) {
    if (isForm) return NextResponse.redirect(new URL(`/${lead.locale}#contact`, request.url), 303);
    return NextResponse.json({ ok: false, reason: "invalid" }, { status: 422 });
  }

  const delivered = await send(leadToText(lead, new Date()));

  if (isForm) {
    const anchor = delivered ? "#contact-sent" : "#contact";
    return NextResponse.redirect(new URL(`/${lead.locale}${anchor}`, request.url), 303);
  }

  return delivered
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ ok: false, reason: "delivery" }, { status: 502 });
}
