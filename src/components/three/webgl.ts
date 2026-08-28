let cached: boolean | null = null;

/**
 * Проверка один раз за сессию: создание контекста стоит дорого, а на
 * машинах с чёрным списком драйверов оно ещё и подтормаживает.
 */
export function supportsWebGL(): boolean {
  if (typeof window === "undefined") return false;
  if (cached !== null) return cached;

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");

    cached = Boolean(gl);

    // Освобождаем тестовый контекст сразу: их количество в браузере ограничено.
    if (gl && "getExtension" in gl) {
      (gl as WebGLRenderingContext)
        .getExtension("WEBGL_lose_context")
        ?.loseContext();
    }
  } catch {
    cached = false;
  }

  return cached;
}
