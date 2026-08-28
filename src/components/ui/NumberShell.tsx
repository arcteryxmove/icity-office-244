import type { Ref } from "react";
import { cn } from "@/lib/cn";

type NumberShellProps = {
  /** Конечное значение. Резервирует ширину и печатается по умолчанию. */
  text: string;
  /** Ссылка на видимый узел: за него счётчик меняет содержимое по кадрам. */
  valueRef?: Ref<HTMLSpanElement>;
  className?: string;
};

/**
 * Оболочка числа. Невидимая копия конечного значения держит ширину: пока
 * счётчик идёт от 0,0 к 244,1, разрядов становится больше, и без резерва
 * единица измерения рядом ползла бы вправо весь отсчёт.
 *
 * Тот же компонент рисует и серверную заглушку, и счётчик — иначе подмена
 * острова меняла бы геометрию числа и давала бы CLS.
 */
export function NumberShell({ text, valueRef, className }: NumberShellProps) {
  return (
    <span className={cn("tabular inline-grid", className)}>
      <span aria-hidden className="invisible col-start-1 row-start-1">
        {text}
      </span>
      <span ref={valueRef} className="col-start-1 row-start-1" data-numeric>
        {text}
      </span>
    </span>
  );
}
