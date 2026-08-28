import { gsap } from "@/lib/gsap";
import { PARALLAX } from "@/lib/motion";

/**
 * Параллакс слоями. Глубина, а не эффект.
 *
 * Два вида, и разница между ними принципиальная.
 *
 * `data-parallax` — кадр с апертурой: сама рамка стоит на месте и режет по
 * себе, внутри неё едет изображение. Именно это читается как глубина:
 * рамка — окно, слой за ним. Масштаб слоя и его ход считаются из одной
 * скорости (см. PARALLAX), поэтому у рамки никогда не открывается щель.
 *
 * `data-parallax-block` — блок целиком против текста своей секции. Апертуры
 * нет, поэтому ход задаётся в пикселях и берётся с медленного края
 * диапазона: блок, который едет быстрее, читается не как глубина, а как
 * «поехало».
 *
 * Направление у обоих одно: сверху вниз относительно рамки. Слой отстаёт
 * от прокрутки, а отстающее воспринимается как дальнее.
 *
 * Пересканирование по MutationObserver обязательно, и это не
 * перестраховка. Плитки галереи и план приходят островами: до их приезда
 * в документе стоит серверная заглушка с теми же атрибутами, а остров
 * подменяет узлы целиком. Тюины, повешенные на заглушку, остаются на
 * узлах, которых больше нет в документе, — параллакс молча перестаёт
 * работать ровно там, где он и задуман. Замерено: слой плана стоял на
 * y = 0.0px во всех точках прохода.
 */
export function initParallax(): () => void {
  const registered = new Map<HTMLElement, gsap.core.Tween>();

  const build = (element: HTMLElement): gsap.core.Tween | null => {
    const block = element.hasAttribute("data-parallax-block");
    const speed = Number(block ? element.dataset.parallaxBlock : element.dataset.parallax);
    if (!Number.isFinite(speed) || speed <= 0) return null;

    const layer = block ? element : element.querySelector<HTMLElement>("img");
    if (!layer) return null;

    const scrollTrigger = {
      trigger: element,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
      invalidateOnRefresh: true,
    } as const;

    if (block) {
      const travel = speed * PARALLAX.blockTravel;
      return gsap.fromTo(
        layer,
        { y: -travel },
        { y: travel, ease: "none", force3D: true, scrollTrigger },
      );
    }

    // Запас с каждой стороны — s/4 высоты слоя. Ход берём на 4% короче
    // запаса: в крайней точке прохода слой иначе встаёт ровно в край рамки,
    // и доля пикселя округления открывает под ним фон плитки волосяной
    // полосой. Замерено: перекрытие 0px сверху при progress = 1.
    gsap.set(layer, { scale: 1 + speed / 2, force3D: true });
    const shift = 24 * speed;
    return gsap.fromTo(
      layer,
      { yPercent: -shift },
      { yPercent: shift, ease: "none", force3D: true, scrollTrigger },
    );
  };

  const drop = (element: HTMLElement) => {
    const tween = registered.get(element);
    if (!tween) return;
    tween.scrollTrigger?.kill();
    tween.kill();
    registered.delete(element);
  };

  const scan = () => {
    for (const element of registered.keys()) {
      if (!element.isConnected) drop(element);
    }
    const found = document.querySelectorAll<HTMLElement>("[data-parallax], [data-parallax-block]");
    for (const element of found) {
      if (registered.has(element)) continue;
      const tween = build(element);
      if (tween) registered.set(element, tween);
    }
  };

  scan();

  let pending = 0;
  const observer = new MutationObserver(() => {
    if (pending !== 0) return;
    pending = requestAnimationFrame(() => {
      pending = 0;
      scan();
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });

  return () => {
    observer.disconnect();
    if (pending !== 0) cancelAnimationFrame(pending);
    for (const element of [...registered.keys()]) {
      const layer = element.hasAttribute("data-parallax-block")
        ? element
        : element.querySelector<HTMLElement>("img");
      drop(element);
      // Возвращаем слой в исходное состояние: иначе при переходе через
      // брейкпоинт вниз кадр останется масштабированным и сдвинутым.
      if (layer) gsap.set(layer, { clearProps: "transform" });
    }
  };
}
