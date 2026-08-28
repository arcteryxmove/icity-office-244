"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { Observer } from "gsap/Observer";

// Регистрация ровно в одном месте. Повторный registerPlugin в каждом
// компоненте безопасен, но тогда легко забыть плагин в новом файле
// и получить молчаливо не работающий скролл-триггер.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, Flip, Observer);
}

export { gsap, ScrollTrigger, SplitText, Flip, Observer };
