/**
 * Готовность сцен от партнёра.
 *
 * Пока флаг false, слот не монтирует ничего: dynamic-импорт не вызывается,
 * IntersectionObserver не вешается, чанк с three и React Three Fiber в сеть
 * не уходит. Замерено: пустая заглушка интро тянула 228,7 КБ по проводу
 * ради сцены, которая ничего не рисует.
 *
 * Партнёр переключает свой флаг в true ровно тогда, когда сцена вставлена.
 * Порядок описан в docs/3D-INTEGRATION.md.
 */
export const SCENES_READY = {
  intro: false,
  floorPlan: false,
  tour: false,
} as const;

export type SceneKey = keyof typeof SCENES_READY;
