import Image from "next/image";
import { useTranslations } from "next-intl";
import { Section } from "@/components/Section";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PARALLAX } from "@/lib/motion";

/**
 * 02 — Сплит: текст слева, карточка платежа и кадр справа, кадр уходит за
 * правый край экрана.
 *
 * Кадр показывает башню и вид, а не помещение 113Н — см. раздел «Статус
 * ассетов» в CLAUDE.md. Alt и любые подписи рядом с ним говорят только о
 * башне и виде из окон.
 *
 * Порядок в разметке: карточка с ценой стоит ДО кадра. Цена лежит в статике
 * первого экрана и не ждёт ни загрузки изображения, ни гидратации — это
 * главное правило проекта.
 *
 * Нижний край секции рисует сам кадр: он доходит до стыка тонов и уходит
 * за правый край экрана. padBottom не нужен, лимит «не больше трёх раз»
 * не тратится.
 *
 * На широкой канве кнопки прижаты к низу колонки: иначе под ними остаётся
 * пустая четверть экрана — правая колонка выше левой на высоту карточки.
 */
export function HeroSection() {
  const t = useTranslations("hero");
  const included = t.raw("included") as string[];

  return (
    <Section id="hero" tone="sky" rhythm="sm" overlap>
      <div className="grid-page items-start gap-y-[4rem] md:gap-y-[5.6rem] lg:items-stretch">
        {/* Текст со второй колонки — но только с 650px: на четырёх колонках
            отступ в четверть ширины съел бы строку заголовка. */}
        <div className="col-span-4 md:col-start-2 md:col-span-11 lg:col-start-2 lg:col-span-11 lg:flex lg:flex-col lg:pb-[8rem]">
          <Eyebrow>{t("eyebrow")}</Eyebrow>

          <h1 className="mt-[1.6rem] tabular font-extralight text-[3.2rem] leading-[1.12] md:text-[4.8rem] lg:text-[6.4rem]">
            {t("title")}
          </h1>

          <p className="mt-[2rem] max-w-[46rem] text-[1.6rem] leading-[1.5] text-slate md:text-[1.7rem]">
            {t("lead")}
          </p>

          <div className="mt-[3.2rem] flex flex-wrap gap-[1.2rem] lg:mt-auto lg:pt-[4rem]">
            <Button href="#contact" external>
              {t("ctaViewing")}
            </Button>
            <Button href="#plan" external variant="secondary">
              {t("ctaPlan")}
            </Button>
          </div>
        </div>

        <div className="col-span-4 md:col-start-2 md:col-span-11 lg:col-start-14 lg:col-span-11">
          <div className="rounded-card border border-hairline bg-paper p-[2.4rem] md:max-w-[46rem] md:p-[3.2rem] lg:max-w-none">
            <p
              className="font-display tabular font-extralight tracking-[-0.02em] text-azure text-[2.4rem] leading-[1.12] md:text-[3.6rem] lg:text-[4.4rem]"
              data-numeric
            >
              {t("price")}
            </p>

            <p className="mt-[0.8rem] tabular text-[1.4rem] text-slate">
              {t("priceNote")}
            </p>

            {/* Линии на белом фоне карточки: см. комментарий в TermsCard. */}
            <ul className="mt-[2.8rem] border-t border-mist">
              {included.map((line) => (
                <li
                  key={line}
                  className="border-b border-mist py-[1.3rem] text-[1.5rem] text-ink"
                >
                  {line}
                </li>
              ))}
            </ul>

            <p className="mt-[1.6rem] tabular text-[1.3rem] text-slate">
              {t("commitment")}
            </p>
          </div>

          {/* Отрицательное поле справа ровно на величину полей страницы:
              кадр доходит до края экрана, а не заканчивается отступом.

              data-parallax: рамка режет по себе, внутри неё едет кадр —
              единственная настоящая апертура на странице, поэтому здесь
              глубокий край диапазона. Скорость читает src/lib/desktop. */}
          <figure
            data-parallax={PARALLAX.hero}
            className="mt-[3.2rem] -mr-[var(--margin-page)] overflow-hidden rounded-l-image md:mt-[4rem]"
          >
            <Image
              src="/renders/IMG_3548.PNG"
              alt={t("imageAlt")}
              width={1681}
              height={936}
              quality={85}
              priority
              // priority кладёт preload в head, но не помечает сам тег.
              // Без fetchPriority кадр делит полосу со скриптами гидратации
              // на равных, хотя он и есть LCP-элемент.
              fetchPriority="high"
              sizes="(min-width: 1275px) 50vw, 100vw"
              className="aspect-[3/2] w-full object-cover md:aspect-[16/9]"
            />
          </figure>
        </div>
      </div>
    </Section>
  );
}
