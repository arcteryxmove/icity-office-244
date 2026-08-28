"use client";

import { useId, useState } from "react";
import { RENT } from "@/content/terms";
import { TermsCard } from "./TermsCard";

/**
 * Живой калькулятор. Приезжает островом, когда секция подошла к экрану:
 * его состояние и обработчики не нужны первому экрану.
 *
 * Пересчёт мгновенный, кнопки нет. Счётчиков тут тоже нет намеренно:
 * человек считает деньги, и цифра, которая догоняет значение, мешает читать.
 */
export default function TermsCalculator() {
  const [term, setTerm] = useState<number>(RENT.defaultTerm);
  const sliderId = useId();

  return <TermsCard term={term} onTermChange={setTerm} sliderId={sliderId} />;
}
