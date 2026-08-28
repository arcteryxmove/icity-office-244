import { useTranslations } from "next-intl";

import { Section } from "@/components/Section";
import { Reveal } from "@/components/ui/Reveal";

type FaqItem = { q: string; a: string };

/**
 * 12 — десять вопросов.
 *
 * Раскрытие нативное, на <details>. Скрипта в секции нет вовсе: ответы
 * приходят в разметке с сервера, поэтому читаются поиском и работают до
 * гидратации. Атрибут name делает список взаимоисключающим средствами
 * браузера; там, где он не поддержан, вопросы просто открываются
 * независимо — деградация без единой ошибки.
 *
 * Ни одного числа мимо раздела «Объект». Вопросов про индексацию ставки,
 * стоимость машиноместа и электрическую мощность здесь нет: этих данных в
 * брифе нет, а придумывать ответ на вопрос о деньгах нельзя.
 */
export function FaqSection() {
  const t = useTranslations("faq");
  const items = t.raw("items") as FaqItem[];

  return (
    <Section id="faq" tone="sky" rhythm="md" eyebrow={t("eyebrow")}>
      <div className="grid-page gap-y-[4rem]">
        <div className="col-span-4 md:col-start-2 md:col-span-10 lg:col-start-2 lg:col-span-13">
          <h2 className="text-[3.2rem] font-extralight leading-[1.12] md:text-[4.4rem] lg:text-[5.2rem]">
            {t("title")}
          </h2>
        </div>

        <Reveal
          as="ul"
          className="col-span-4 border-t border-hairline md:col-start-2 md:col-span-10 lg:col-start-2 lg:col-span-16"
        >
          {items.map((item, index) => (
            <li key={item.q} className="border-b border-hairline">
              <details name="faq" className="group">
                <summary
                  className="grid cursor-pointer list-none grid-cols-[minmax(0,3.2rem)_minmax(0,1fr)_2.4rem] items-baseline gap-x-[1.6rem] py-[2rem] [&::-webkit-details-marker]:hidden md:grid-cols-[minmax(0,4.8rem)_minmax(0,1fr)_2.4rem] md:gap-x-[2.4rem]"
                >
                  <span className="tabular text-[1.3rem] leading-[1.5] text-slate">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {/* Заголовок внутри summary допустим по спецификации и даёт
                      скринридеру привычную навигацию по вопросам. */}
                  <h3 className="text-[1.6rem] font-normal leading-[1.35] text-ink md:text-[1.8rem]">
                    {item.q}
                  </h3>
                  {/* Плюс из двух линий: вторая гаснет на раскрытии. Крутить
                      значок не нужно, движение читается и без вращения. */}
                  <span
                    aria-hidden
                    className="relative mt-[0.6rem] block h-[1.4rem] w-[1.4rem] justify-self-end"
                  >
                    <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-slate" />
                    <span className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-slate transition-opacity duration-[var(--duration-ui)] ease-ui group-open:opacity-0" />
                  </span>
                </summary>
                <p className="max-w-[62rem] pb-[2.4rem] text-[1.5rem] leading-[1.55] text-slate md:col-start-2 md:ml-[7.2rem] md:text-[1.6rem]">
                  {item.a}
                </p>
              </details>
            </li>
          ))}
        </Reveal>

        <Reveal
          as="p"
          index={1}
          className="col-span-4 text-[1.5rem] leading-[1.5] text-slate md:col-start-2 md:col-span-10 lg:col-start-2 lg:col-span-11"
        >
          {t("lead")}
        </Reveal>
      </div>
    </Section>
  );
}
