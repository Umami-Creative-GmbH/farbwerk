/**
 * Palette → CSS custom properties.
 *
 * Two layers are emitted onto the gallery wrapper:
 *
 * 1. The raw palette — `--p-50…--p-950`, `--s-*`, `--t-*` — for anything that
 *    wants a specific step.
 * 2. A remap of the shadcn theme tokens (`--primary`, `--card`, `--chart-1`…)
 *    onto those steps. This is what lets the dashboard-01 blocks and the chart
 *    components repaint from a palette without being modified at all.
 */
import { readableInk } from "./contrast";
import type { ColorScale, ScaleKey, ScaleRole } from "./types";

export interface PaletteScales {
  primary: ColorScale;
  secondary?: ColorScale | null;
  tertiary?: ColorScale | null;
}

export type ThemeMode = "light" | "dark";

/** Short CSS var prefix per role: `--p-500`, `--s-500`, `--t-500`. */
const ROLE_PREFIX: Record<ScaleRole, string> = {
  primary: "p",
  secondary: "s",
  tertiary: "t",
};

const WHITE = "#ffffff";

/**
 * Roles the user has not added fall back to the previous one, so a
 * single-scale palette still paints every widget.
 */
function resolveScales(scales: PaletteScales): Record<ScaleRole, ColorScale> {
  const { primary } = scales;
  const secondary = scales.secondary ?? primary;
  return { primary, secondary, tertiary: scales.tertiary ?? secondary };
}

/** `--p-50` … `--t-950` for every role. */
export function paletteVars(scales: PaletteScales): Record<string, string> {
  const resolved = resolveScales(scales);
  const vars: Record<string, string> = {};
  for (const [role, prefix] of Object.entries(ROLE_PREFIX)) {
    const scale = resolved[role as ScaleRole];
    for (const [key, hex] of Object.entries(scale)) {
      vars[`--${prefix}-${key}`] = hex;
    }
  }
  return vars;
}

/**
 * Which palette step each shadcn token points at, per mode. Written as data
 * rather than branches so the two modes can be read side by side — and so the
 * values stay `var()` references, letting one palette change move everything.
 */
const TOKEN_STEPS: Record<ThemeMode, Record<string, string>> = {
  dark: {
    "--accent": "var(--s-800)",
    "--accent-foreground": "var(--s-50)",
    "--background": "var(--p-950)",
    "--border": "var(--p-800)",
    "--card": "var(--p-900)",
    "--card-foreground": "var(--p-50)",
    "--chart-1": "var(--p-400)",
    "--chart-2": "var(--s-400)",
    "--chart-3": "var(--t-400)",
    "--chart-4": "var(--p-200)",
    "--chart-5": "var(--s-600)",
    "--foreground": "var(--p-50)",
    "--input": "var(--p-800)",
    "--muted": "var(--p-800)",
    "--muted-foreground": "var(--p-300)",
    "--popover": "var(--p-900)",
    "--popover-foreground": "var(--p-50)",
    "--primary": "var(--p-400)",
    "--ring": "var(--p-600)",
    "--secondary": "var(--s-800)",
    "--secondary-foreground": "var(--s-50)",
    "--sidebar": "var(--p-900)",
    "--sidebar-accent": "var(--p-800)",
    "--sidebar-accent-foreground": "var(--p-100)",
    "--sidebar-border": "var(--p-800)",
    "--sidebar-foreground": "var(--p-50)",
    "--sidebar-primary": "var(--p-400)",
    "--sidebar-ring": "var(--p-600)",
  },
  light: {
    "--accent": "var(--s-100)",
    "--accent-foreground": "var(--s-900)",
    "--background": "var(--p-50)",
    "--border": "var(--p-200)",
    "--card": WHITE,
    "--card-foreground": "var(--p-950)",
    // Charts read these five. Spreading them across all three roles is what
    // makes a multi-scale palette legible in a stacked area or a donut.
    "--chart-1": "var(--p-500)",
    "--chart-2": "var(--s-500)",
    "--chart-3": "var(--t-500)",
    "--chart-4": "var(--p-300)",
    "--chart-5": "var(--s-700)",
    "--foreground": "var(--p-950)",
    "--input": "var(--p-200)",
    "--muted": "var(--p-100)",
    "--muted-foreground": "var(--p-700)",
    "--popover": WHITE,
    "--popover-foreground": "var(--p-950)",
    "--primary": "var(--p-600)",
    "--ring": "var(--p-400)",
    "--secondary": "var(--s-100)",
    "--secondary-foreground": "var(--s-900)",
    "--sidebar": "var(--p-100)",
    "--sidebar-accent": "var(--p-200)",
    "--sidebar-accent-foreground": "var(--p-900)",
    "--sidebar-border": "var(--p-200)",
    "--sidebar-foreground": "var(--p-950)",
    "--sidebar-primary": "var(--p-600)",
    "--sidebar-ring": "var(--p-400)",
  },
};

/** The step `--primary` points at, whose ink has to be resolved eagerly. */
const ACCENT_STEP: Record<ThemeMode, ScaleKey> = { dark: 400, light: 600 };

/**
 * shadcn's theme tokens, expressed against the palette. Only the ink colors are
 * resolved to real hex, because picking one needs the actual contrast of the
 * surface underneath.
 */
export function themeVars(
  scales: PaletteScales,
  mode: ThemeMode = "light"
): Record<string, string> {
  const { primary } = resolveScales(scales);
  const ink = readableInk(primary[ACCENT_STEP[mode]]);

  return {
    ...TOKEN_STEPS[mode],
    "--primary-foreground": ink,
    "--sidebar-primary-foreground": ink,
  };
}

/** Everything the gallery wrapper needs, ready for a `style` prop. */
export function galleryVars(
  scales: PaletteScales,
  mode: ThemeMode = "light"
): Record<string, string> {
  return { ...paletteVars(scales), ...themeVars(scales, mode) };
}
