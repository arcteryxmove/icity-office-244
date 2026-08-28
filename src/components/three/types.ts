/**
 * Контракт слотов 3D. Партнёр меняет только содержимое сцены и не трогает
 * вёрстку. Полное описание — docs/3D-INTEGRATION.md.
 */
export type SceneContract = {
  /** Сцена рендерится только когда видна. false — кадры не считаются. */
  active: boolean;
  /** Сцена готова — снимаем экран загрузки. */
  onReady?: () => void;
  /** Процент для индикатора, 0–100. */
  onProgress?: (percent: number) => void;
  /** Падаем в статичный fallback, не в белый экран. */
  onError?: (error: Error) => void;
};

/** То, что принимает слот снаружи. active необязателен: по умолчанию — вьюпорт. */
export type SceneSlotProps = Partial<SceneContract> & {
  className?: string;
};
