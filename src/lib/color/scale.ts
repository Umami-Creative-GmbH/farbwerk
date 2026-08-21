/**
 * Tailwind 50–950 scale generation in OKLCH.
 *
 * The base color is never forced to 500. We find the step whose canonical
 * lightness sits closest to the base, pin the base there, and interpolate each
 * side of that anchor towards the ramp's endpoints.
 */
import {
  DEFAULT_GAMUT_METHOD,
  type GamutMethod,
  hexToOklch,
  normalizeHex,
  oklchToHex,
} from "./convert";
import {
  type ColorScale,
  type Oklch,
  SCALE_KEYS,
  type ScaleKey,
} from "./types";

/** Target OKLCH lightness per step — the shape of a Tailwind ramp. */
export const LIGHTNESS_TARGETS: Record<ScaleKey, number> = {
  50: 0.971,
  100: 0.936,
  200: 0.885,
  300: 0.813,
  400: 0.723,
  500: 0.637,
  600: 0.567,
  700: 0.497,
  800: 0.442,
  900: 0.396,
  950: 0.283,
};

/** Chroma multiplier per step, relative to step 500. */
export const CHROMA_MULTIPLIERS: Record<ScaleKey, number> = {
  50: 0.09,
  100: 0.17,
  200: 0.34,
  300: 0.55,
  400: 0.8,
  500: 1,
  600: 1.02,
  700: 0.95,
  800: 0.85,
  900: 0.76,
  950: 0.58,
};

export type StepTag =
  | "tint"
  | "surface"
  | "hover"
  | "base"
  | "action"
  | "text"
  | "deep";

/** What each step is for, shown next to the swatch in the Color info tab. */
export const STEP_TAGS: Record<ScaleKey, StepTag> = {
  50: "tint",
  100: "tint",
  200: "surface",
  300: "surface",
  400: "hover",
  500: "base",
  600: "action",
  700: "text",
  800: "text",
  900: "deep",
  950: "deep",
};

/** Slider bounds for the three ramp controls in the sidebar. */
export const CHROMA_RANGE = { max: 1.6, min: 0.2, step: 0.01 } as const;
export const HUE_SHIFT_RANGE = { max: 40, min: -40, step: 1 } as const;
export const SPREAD_RANGE = { max: 1.4, min: 0.6, step: 0.01 } as const;

const DEFAULT_CHROMA = 1;
const DEFAULT_HUE_SHIFT = 0;
const DEFAULT_SPREAD = 1;

// Keep the base off the very ends of the lightness axis, where the ramp
// degenerates and every step would round to the same hex.
const LIGHTNESS_FLOOR = 0.06;
const LIGHTNESS_CEILING = 0.99;
// How far past the base the ramp may reach when the base is already extreme.
const ENDPOINT_HEADROOM = 0.03;
const MAX_ENDPOINT_LIGHTNESS = 0.995;
const MIN_ENDPOINT_LIGHTNESS = 0.04;
// Lightness distance at which a side spreads fully evenly instead of following
// the canonical ramp — this is what stops steps collapsing on extreme bases.
const EVEN_SPREAD_WINDOW = 0.22;
/** `hueShift` is expressed in degrees per five steps. */
const HUE_SHIFT_SPAN = 5;
const MIN_CHROMA = 0.004;
const MAX_CHROMA = 0.37;
const DEGENERATE_SPAN = 0.001;

/** `auto` detects the anchor from the base's lightness; a key pins it. */
export type AnchorSetting = "auto" | ScaleKey;

export interface ScaleOptions {
  anchor?: AnchorSetting;
  /** Base color as hex. */
  base: string;
  /** Chroma multiplier applied to the whole ramp. */
  chroma?: number;
  gamut?: GamutMethod;
  /** Hue drift in degrees per five steps. */
  hueShift?: number;
  /** Hand-edited steps, used verbatim. */
  overrides?: Partial<Record<ScaleKey, string>>;
  /** Contrast spread — how far each side reaches towards its endpoint. */
  spread?: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** The step whose canonical lightness sits closest to this color's. */
export function detectAnchorStep(base: string): ScaleKey {
  const { l } = hexToOklch(base);
  let best: ScaleKey = 500;
  for (const key of SCALE_KEYS) {
    const isCloser =
      Math.abs(LIGHTNESS_TARGETS[key] - l) <
      Math.abs(LIGHTNESS_TARGETS[best] - l);
    if (isCloser) {
      best = key;
    }
  }
  return best;
}

export function resolveAnchorStep(
  base: string,
  anchor: AnchorSetting = "auto"
): ScaleKey {
  return anchor === "auto" ? detectAnchorStep(base) : anchor;
}

interface RampContext {
  anchorIndex: number;
  anchorKey: ScaleKey;
  base: Oklch;
  chroma: number;
  hueShift: number;
  spread: number;
}

/**
 * Where step `index` sits between the anchor and its endpoint, 0–1.
 *
 * Blends the canonical Tailwind spacing with even spacing: the further the base
 * sits from its own step's natural lightness, the more evenly the side spreads.
 */
function rampPosition(ctx: RampContext, key: ScaleKey, index: number): number {
  const anchorLightness = LIGHTNESS_TARGETS[ctx.anchorKey];
  const lighter = LIGHTNESS_TARGETS[key] > anchorLightness;
  const span = lighter
    ? LIGHTNESS_TARGETS[50] - anchorLightness
    : anchorLightness - LIGHTNESS_TARGETS[950];
  const rampT =
    span > DEGENERATE_SPAN
      ? Math.abs(LIGHTNESS_TARGETS[key] - anchorLightness) / span
      : 1;
  const sideSteps = lighter
    ? ctx.anchorIndex
    : SCALE_KEYS.length - 1 - ctx.anchorIndex;
  const evenT =
    sideSteps > 0 ? Math.abs(index - ctx.anchorIndex) / sideSteps : 1;
  const baseLightness = clamp(ctx.base.l, LIGHTNESS_FLOOR, LIGHTNESS_CEILING);
  const evenWeight = clamp(
    Math.abs(baseLightness - anchorLightness) / EVEN_SPREAD_WINDOW,
    0,
    1
  );
  return clamp(
    (rampT * (1 - evenWeight) + evenT * evenWeight) * ctx.spread,
    0,
    1
  );
}

function stepColor(ctx: RampContext, key: ScaleKey, index: number): Oklch {
  const lighter = LIGHTNESS_TARGETS[key] > LIGHTNESS_TARGETS[ctx.anchorKey];
  const baseLightness = clamp(ctx.base.l, LIGHTNESS_FLOOR, LIGHTNESS_CEILING);
  const top = Math.max(
    LIGHTNESS_TARGETS[50],
    Math.min(MAX_ENDPOINT_LIGHTNESS, baseLightness + ENDPOINT_HEADROOM)
  );
  const bottom = Math.min(
    LIGHTNESS_TARGETS[950],
    Math.max(MIN_ENDPOINT_LIGHTNESS, baseLightness - ENDPOINT_HEADROOM)
  );

  const t = rampPosition(ctx, key, index);
  const l = lighter
    ? baseLightness + t * (top - baseLightness)
    : baseLightness - t * (baseLightness - bottom);

  const endpointChroma =
    (lighter ? CHROMA_MULTIPLIERS[50] : CHROMA_MULTIPLIERS[950]) /
    CHROMA_MULTIPLIERS[ctx.anchorKey];
  const c = clamp(
    ctx.base.c * (1 + t * (endpointChroma - 1)) * ctx.chroma,
    MIN_CHROMA,
    MAX_CHROMA
  );

  const h =
    ctx.base.h + ctx.hueShift * ((index - ctx.anchorIndex) / HUE_SHIFT_SPAN);
  return { c, h, l };
}

/** Generate the full 50–950 ramp for one role. */
export function buildScale(options: ScaleOptions): ColorScale {
  const {
    chroma = DEFAULT_CHROMA,
    hueShift = DEFAULT_HUE_SHIFT,
    spread = DEFAULT_SPREAD,
    anchor = "auto",
    overrides = {},
    gamut = DEFAULT_GAMUT_METHOD,
  } = options;

  const base = normalizeHex(options.base);
  if (!base) {
    throw new Error(`Not a valid base color: "${options.base}"`);
  }

  const anchorKey = resolveAnchorStep(base, anchor);
  const ctx: RampContext = {
    anchorIndex: SCALE_KEYS.indexOf(anchorKey),
    anchorKey,
    base: hexToOklch(base),
    chroma,
    hueShift,
    spread,
  };

  const scale = {} as ColorScale;
  for (const [index, key] of SCALE_KEYS.entries()) {
    const override = overrides[key];
    if (override) {
      scale[key] = normalizeHex(override) ?? override;
    } else if (key === anchorKey) {
      scale[key] = base;
    } else {
      scale[key] = oklchToHex(stepColor(ctx, key, index), gamut);
    }
  }
  return scale;
}
