import { useLocale, useTranslations } from "next-intl";

import { Section } from "@/components/Section";
import { Reveal } from "@/components/ui/Reveal";
import { CONTACT_FORM_CLASS, ContactFields } from "@/components/sections/ContactFields";
import { LazyIsland } from "@/components/ui/LazyIsland";

/** Телефон для ссылки: цифрами, без маски. Показываем при этом маску. */
const PHONE_HREF = "tel:+79093798015";
const EMAIL_HREF = "mailto:kryakushina@arenda-34.ru";

/**
 * 13 — управляющая и форма заявки.
 *
 * Форма — остров: её код едет отдельным чанком и в бандл первого экрана не
 * попадает. Заглушка — та же разметка полей в обычной форме с action, так
 * что до приезда чанка кнопка отправляет заявку нативно, а не молчит.
 *
 * Живой контакт стоит рядом с формой и выше её по порядку чтения: человек,
 * который не заполняет формы, должен видеть телефон, а не искать его.
 *
 * padBottom здесь второй раз на весь сайт и по делу: снизу белая карточка
 * формы, и без нижнего поля она упёрлась бы в границу с футером.
 */
export function ContactSection() {
  const t = useTranslations("contact");
  const locale = useLocale();

  return (
    <Section id="contact" tone="azure" rhythm="lg" padBottom eyebrow={t("eyebrow")}>
      <div className="grid-page gap-y-[4.8rem]">
        <div className="col-span-4 md:col-start-2 md:col-span-10 lg:col-start-2 lg:col-span-10">
          <h2 className="text-[3.2rem] font-extralight leading-[1.12] md:text-[4.4rem] lg:text-[5.2rem]">
            {t("title")}
          </h2>

          <Reveal className="mt-[3.2rem]">
            <p className="text-[1.8rem] leading-[1.3] text-paper md:text-[2rem]">
              {t("managerName")}
            </p>
            <p className="mt-[0.4rem] text-[1.5rem] leading-[1.4] text-paper md:text-[1.6rem]">
              {t("managerRole")}
            </p>
          </Reveal>

          <Reveal as="ul" index={1} className="mt-[2.4rem] flex flex-col gap-[1.2rem]">
            <li>
              <a
                href={PHONE_HREF}
                className="tabular text-[2rem] leading-[1.2] text-paper underline decoration-paper/40 decoration-1 underline-offset-[0.6rem] transition-colors duration-[var(--duration-ui)] ease-ui hover:decoration-paper focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-paper md:text-[2.4rem]"
              >
                {t("phone")}
              </a>
            </li>
            <li>
              <a
                href={EMAIL_HREF}
                className="text-[1.6rem] leading-[1.3] break-words text-paper underline decoration-paper/40 decoration-1 underline-offset-[0.6rem] transition-colors duration-[var(--duration-ui)] ease-ui hover:decoration-paper focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-paper md:text-[1.8rem]"
              >
                {t("email")}
              </a>
            </li>
            <li className="text-[1.6rem] leading-[1.3] text-paper md:text-[1.8rem]">
              {t("messenger")}
            </li>
          </Reveal>

          <Reveal
            as="p"
            index={2}
            className="mt-[2.4rem] text-[1.5rem] leading-[1.5] text-paper md:text-[1.6rem]"
          >
            {t("owner")}
          </Reveal>
        </div>

        <div className="col-span-4 md:col-start-2 md:col-span-10 lg:col-start-13 lg:col-span-11">
          {/* Виден только после нативной отправки, когда остров ещё не приехал:
              обработчик возвращает человека сюда с якорем. */}
          <p
            id="contact-sent"
            className="mb-[2rem] hidden rounded-card bg-sky p-[2rem] text-[1.6rem] leading-[1.4] text-ink target:block"
          >
            {t("sentAnchor")}
          </p>

          <Reveal index={1} className="rounded-card bg-paper p-[2.4rem] md:p-[3.2rem]">
            <LazyIsland
              island="contactForm"
              fallback={
                <form action="/api/lead" method="post" className={CONTACT_FORM_CLASS}>
                  <input type="hidden" name="locale" value={locale} />
                  <ContactFields />
                </form>
              }
            />
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
