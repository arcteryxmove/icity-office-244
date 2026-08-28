import type { ReactNode } from "react";
import { AnimatedNumber } from "./AnimatedNumber";
import { cn } from "@/lib/cn";

type StatBlockProps = {
  /** Число отсчитывается, строка выводится как есть. */
  value: number | string;
  decimals?: number;
  unit?: ReactNode;
  label: ReactNode;
  caption?: ReactNode;
  className?: string;
};

export function StatBlock({
  value,
  decimals = 0,
  unit,
  label,
  caption,
  className,
}: StatBlockProps) {
  return (
    <div className={cn("flex flex-col gap-[0.8rem]", className)}>
      <p className="font-display text-[4.8rem] font-extralight leading-[1.05] tracking-[-0.02em] text-ink md:text-[6.4rem]">
        {typeof value === "number" ? (
          <AnimatedNumber value={value} decimals={decimals} />
        ) : (
          <span className="tabular" data-numeric>
            {value}
          </span>
        )}
        {unit ? (
          <span className="ml-[0.4rem] text-[0.45em] text-slate">{unit}</span>
        ) : null}
      </p>

      <p className="text-[1.5rem] text-ink">{label}</p>

      {caption ? <p className="text-[1.3rem] text-slate">{caption}</p> : null}
    </div>
  );
}
