import { initCursor } from "./cursor";
import { initMagnetic } from "./magnetic";
import { initOverlap } from "./overlap";
import { initParallax } from "./parallax";

/**
 * Вторая часть анимации: параллакс, наезд секций, магнитные кнопки,
 * кастомный курсор. Один чанк на все четыре — он приезжает после готовности
 * плавного скролла, то есть заведомо после LCP, и на первый экран не едет
 * ни байтом.
 *
 * Два уровня допуска, и они разные. Параллакс и наезд — про прокрутку, им
 * достаточно широкой канвы. Магнитные кнопки и курсор — про указатель, и
 * без точного указателя они не просто бесполезны: магнитная кнопка под
 * пальцем уезжает из-под касания.
 *
 * Мобильный и prefers-reduced-motion отсекаются выше, в DesktopMotion.
 */
export function initDesktopMotion(): () => void {
  const disposers = [initParallax(), initOverlap()];

  if (window.matchMedia("(pointer: fine)").matches) {
    disposers.push(initMagnetic(), initCursor());
  }

  return () => {
    for (const dispose of disposers) dispose();
  };
}
