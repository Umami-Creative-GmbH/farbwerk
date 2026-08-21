/**
 * Shared vocabulary for the palette engine.
 *
 * Everything downstream (scale generation, harmony, contrast, naming) speaks in
 * these types, so a scale is always the same shape no matter who produced it.
 */

/** Tailwind's canonical 11 steps, ordered light to dark. */
export const SCALE_KEYS = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
] as const;

/** One step of a Tailwind scale. */
export type ScaleKey = (typeof SCALE_KEYS)[number];

/** A generated ramp: every step mapped to a lowercase 6-digit hex string. */
export type ColorScale = Record<ScaleKey, string>;

/**
 * An OKLCH triple. `l` is 0–1 (not a percentage), `c` is absolute chroma
 * (roughly 0–0.37 inside sRGB) and `h` is degrees, 0–360.
 */
export interface Oklch {
  c: number;
  h: number;
  l: number;
}

/** 8-bit sRGB channels, 0–255. */
export type Rgb = [red: number, green: number, blue: number];

/** The three scales a palette can hold. */
export type ScaleRole = "primary" | "secondary" | "tertiary";

/** Roles that can be linked to primary through a harmony rule. */
export type LinkedRole = Exclude<ScaleRole, "primary">;

/** Output notations offered by the export modal and the color info table. */
export type ColorNotation = "hex" | "oklch" | "hsl" | "rgb";

const SCALE_KEY_SET: ReadonlySet<number> = new Set(SCALE_KEYS);

export function isScaleKey(value: number): value is ScaleKey {
  return SCALE_KEY_SET.has(value);
}
