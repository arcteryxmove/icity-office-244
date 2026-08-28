"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";

type BaseProps = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

type ButtonAsButton = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

type ButtonAsLink = BaseProps & {
  href: string;
  /** Внешние ссылки (tel:, mailto:, карты) не проходят через роутер next-intl. */
  external?: boolean;
  /** Открыть в новой вкладке. rel проставляется здесь, а не на месте вызова. */
  newTab?: boolean;
};

type ButtonProps = ButtonAsButton | ButtonAsLink;

const base =
  "inline-flex items-center justify-center gap-[0.8rem] rounded-pill " +
  "px-[2.4rem] py-[1.2rem] text-[1.5rem] font-medium leading-none " +
  "transition-colors duration-[var(--duration-ui)] ease-ui " +
  "focus-visible:outline-2 focus-visible:outline-offset-[3px] " +
  "disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  // Основное действие. Белое на azure проходит AA (6.2:1).
  primary:
    "bg-azure text-paper hover:bg-ink focus-visible:outline-ink",
  // Второстепенное: обводка 1px цветом mist, теней нет.
  secondary:
    "border border-hairline bg-paper text-ink hover:border-azure hover:text-azure " +
    "focus-visible:outline-azure",
  // Третий уровень: только текст, подчёркивание вместо фона.
  ghost:
    "px-0 text-azure underline decoration-mist decoration-1 underline-offset-[0.6rem] " +
    "hover:decoration-azure focus-visible:outline-azure",
};

export function Button(props: ButtonProps) {
  const { children, variant = "primary", className } = props;
  const classes = cn(base, variants[variant], className);
  // Магнит только у кнопок с формой. У ghost формы нет — это текст со
  // подчёркиванием, и тянуть строку текста к курсору незачем.
  const magnetic = variant === "ghost" ? undefined : "";

  if ("href" in props && props.href !== undefined) {
    const { href, external, newTab } = props;

    if (external) {
      return (
        <a
          href={href}
          className={classes}
          data-magnetic={magnetic}
          target={newTab ? "_blank" : undefined}
          rel={newTab ? "noopener noreferrer" : undefined}
        >
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={classes} data-magnetic={magnetic}>
        {children}
      </Link>
    );
  }

  const {
    variant: variantProp,
    className: classNameProp,
    children: childrenProp,
    href: hrefProp,
    ...rest
  } = props as ButtonAsButton;

  return (
    <button type="button" className={classes} data-magnetic={magnetic} {...rest}>
      {children}
    </button>
  );
}
