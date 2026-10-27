/**
 * Color conversion and gamut mapping, backed by colorjs.io.
 *
 * The functional (`colorjs.io/fn`) entry point is used so only the spaces we
 * actually touch end up in the bundle. Registration happens once, here, and
 * every other module in `lib/color` imports through this file — which also
 * guarantees the spaces are registered before anyone parses a string.
 */
import {
  ColorSpace,
  HSL,
  inGamut,
  OKLab,
  OKLCH,
  parse,
  serialize,
  sRGB,
  sRGB_Linear,
  to,
  toGamut,
} from "colorjs.io/fn";
import type { PlainColorObject } from "colorjs.io/fn";

import type { ColorNotation, Oklch, Rgb } from "./types";

ColorSpace.register(sRGB_Linear);
ColorSpace.register(sRGB);
ColorSpace.register(HSL);
ColorSpace.register(OKLab);
ColorSpace.register(OKLCH);

const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;
const SHORTHAND_LENGTH = 3;
const RGB_MAX = 255;
const FULL_TURN = 360;
const PERCENT = 100;
const OKLCH_CHROMA_DIGITS = 3;
const OKLCH_ANGLE_DIGITS = 1;

/**
 * How an out-of-sRGB OKLCH color is brought back into range.
 *
 * - `chroma` — reduce chroma until the color fits, keeping lightness and hue.
 *   The default, and what the spec calls for: hue stability matters more to a
 *   palette than squeezing out the last bit of saturation.
 * - `css` — the CSS Color 4 gamut mapping algorithm. Perceptually closest to the
 *   requested color, but its final clip can drift hue by a few degrees.
 * - `clip` — clip channels. Fast, and drifts hue the most.
 */
export type GamutMethod = "css" | "chroma" | "clip";

const GAMUT_METHODS: Record<GamutMethod, string> = {
  chroma: "oklch.c",
  clip: "clip",
  css: "css",
};

export const DEFAULT_GAMUT_METHOD: GamutMethod = "chroma";

/**
 * Normalize any hex spelling to lowercase `#rrggbb`, or `null` when the input
 * is not a hex color. Use this to validate before calling anything else here.
 */
export function normalizeHex(input: string): string | null {
  const match = HEX_PATTERN.exec(input.trim());
  if (!match) {
    return null;
  }
  const digits = match[1].toLowerCase();
  if (digits.length !== SHORTHAND_LENGTH) {
    return `#${digits}`;
  }
  return `#${digits.replaceAll(/./g, "$&$&")}`;
}

/** Parse a hex string into a colorjs color object in sRGB. */
export function parseHexColor(hex: string): PlainColorObject {
  const normalized = normalizeHex(hex);
  if (!normalized) {
    throw new Error(`Not a valid hex color: "${hex}"`);
  }
  return to(parse(normalized), sRGB);
}

function wrapHue(hue: number): number {
  return ((hue % FULL_TURN) + FULL_TURN) % FULL_TURN;
}

/**
 * colorjs can report a channel as "none" (null or NaN) — most often the hue of
 * an achromatic color. The ramp math wants a number, and 0 is as good as any
 * hue when there is no chroma to carry it.
 */
function coord(value: number | null | undefined): number {
  return value === null || value === undefined || Number.isNaN(value)
    ? 0
    : value;
}

function oklchColor(color: Oklch): PlainColorObject {
  return {
    alpha: 1,
    coords: [color.l, color.c, wrapHue(color.h)],
    space: OKLCH,
  };
}

export function hexToOklch(hex: string): Oklch {
  const [l, c, h] = to(parseHexColor(hex), OKLCH).coords;
  return { c: coord(c), h: coord(h), l: coord(l) };
}

/** True when the OKLCH triple can be shown on an sRGB display without mapping. */
export function isInSrgbGamut(color: Oklch): boolean {
  return inGamut(oklchColor(color), sRGB);
}

/** The nearest in-gamut OKLCH triple — what `oklchToHex` will actually render. */
export function clampToSrgb(
  color: Oklch,
  method: GamutMethod = DEFAULT_GAMUT_METHOD
): Oklch {
  const [l, c, h] = to(toSrgb(color, method), OKLCH).coords;
  return { c: coord(c), h: coord(h), l: coord(l) };
}

function toSrgb(color: Oklch, method: GamutMethod): PlainColorObject {
  // toGamut mutates its argument, so it only ever sees the fresh object from to().
  return toGamut(to(oklchColor(color), sRGB), {
    method: GAMUT_METHODS[method],
  });
}

/** Render an OKLCH triple as `#rrggbb`, gamut-mapping it into sRGB first. */
export function oklchToHex(
  color: Oklch,
  method: GamutMethod = DEFAULT_GAMUT_METHOD
): string {
  return serialize(toSrgb(color, method), { collapse: false, format: "hex" });
}

export function hexToRgb(hex: string): Rgb {
  const [r, g, b] = parseHexColor(hex).coords;
  return [channel(coord(r)), channel(coord(g)), channel(coord(b))];
}

function channel(value: number): number {
  return Math.min(RGB_MAX, Math.max(0, Math.round(value * RGB_MAX)));
}

export function rgbToHex(rgb: Rgb): string {
  return serialize(
    { alpha: 1, coords: rgb.map((v) => v / RGB_MAX) as Rgb, space: sRGB },
    { collapse: false, format: "hex" }
  );
}

/** Format one hex color in the notation picked in the export modal. */
export function formatColor(hex: string, notation: ColorNotation): string {
  if (notation === "rgb") {
    return `rgb(${hexToRgb(hex).join(" ")})`;
  }
  if (notation === "oklch") {
    const { l, c, h } = hexToOklch(hex);
    const lightness = (l * PERCENT).toFixed(OKLCH_ANGLE_DIGITS);
    return `oklch(${lightness}% ${c.toFixed(OKLCH_CHROMA_DIGITS)} ${h.toFixed(OKLCH_ANGLE_DIGITS)})`;
  }
  if (notation === "hsl") {
    const [h, s, l] = to(parseHexColor(hex), HSL).coords;
    return `hsl(${Math.round(coord(h))} ${Math.round(coord(s))}% ${Math.round(coord(l))}%)`;
  }
  return normalizeHex(hex) ?? hex;
}
