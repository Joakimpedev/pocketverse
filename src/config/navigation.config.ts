/**
 * Central config for root Stack navigation (screen transitions).
 * Change these to fine-tune transitions across all pages.
 */

/** Duration of screen fade transition in ms. iOS only; Android uses platform default. Default was 350; ~half = 175. */
export const SCREEN_ANIMATION_DURATION_MS = 175;

/** Stack screen transition type. Use "fade" for crossfade, or e.g. "slide_from_right", "default". */
export const SCREEN_ANIMATION_TYPE = "fade" as const;
