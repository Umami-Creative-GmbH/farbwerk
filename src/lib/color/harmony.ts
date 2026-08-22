/**
 * Harmony generation — secondary and tertiary bases derived from primary.
 *
 * Derivation is deliberately a read-time function, not a one-shot write: every
 * consumer (strip, sidebar, matrix, info table, export, widget gallery) resolves
 * its base through `resolveRoleBase`, so editing primary instantly re-derives
 * every linked role everywhere.
 */
import { hexToOklch, normalizeHex, oklchToHex } from "./convert";
import type { LinkedRole, ScaleRole } from "./types";

const FULL_TURN = 360;

/** Hue offsets in degrees, applied to primary's hue. */
export const HARMONY_OFFSETS = {
  analogous: { secondary: 30, tertiary: -30 },
  auto: { secondary: 165, tertiary: 285 },
  complement: { secondary: 180, tertiary: 210 },
  // Mono keeps the hue and desaturates instead — see MONO_CHROMA_FACTOR.
  mono: { secondary: 0, tertiary: 0 },
  split: { secondary: 150, tertiary: 210 },
  square: { secondary: 90, tertiary: 180 },
  tetradic: { secondary: 60, tertiary: 240 },
  triadic: { secondary: 120, tertiary: 240 },
} as const satisfies Record<string, Record<LinkedRole, number>>;

/** Display order of the harmony dropdown. */
export const HARMONY_RULES = [
  "auto",
  "analogous",
  "complement",
  "split",
  "triadic",
  "tetradic",
  "square",
  "mono",
] as const;

export type HarmonyRule = (typeof HARMONY_RULES)[number];

/** `manual` means someone typed a hex, which breaks the link to primary. */
export type HarmonySetting = HarmonyRule | "manual";

/** Mono keeps primary's hue and lightness, dropping chroma per role. */
const MONO_CHROMA_FACTOR: Record<LinkedRole, number> = {
  secondary: 0.55,
  tertiary: 0.28,
};

/** Starting hue offset when a role is first added from the sidebar. */
export const NEW_ROLE_HUE_OFFSET: Record<LinkedRole, number> = {
  secondary: 150,
  tertiary: 260,
};

function rotate(hue: number, degrees: number): number {
  return (((hue + degrees) % FULL_TURN) + FULL_TURN) % FULL_TURN;
}

/** Apply one harmony rule to primary's base, keeping its lightness. */
export function harmonizeBase(
  primaryBase: string,
  role: LinkedRole,
  rule: HarmonyRule
): string {
  const base = hexToOklch(primaryBase);
  if (rule === "mono") {
    return oklchToHex({ ...base, c: base.c * MONO_CHROMA_FACTOR[role] });
  }
  return oklchToHex({
    ...base,
    h: rotate(base.h, HARMONY_OFFSETS[rule][role]),
  });
}

/** The base a role should render with right now. */
export function resolveRoleBase(params: {
  role: ScaleRole;
  harmony: HarmonySetting;
  /** The role's own base — used when it is primary or unlinked. */
  base: string;
  primaryBase: string;
}): string {
  const { role, harmony, base, primaryBase } = params;
  if (role === "primary" || harmony === "manual") {
    return normalizeHex(base) ?? base;
  }
  return harmonizeBase(primaryBase, role, harmony);
}

/** A fresh base for a role the user just added, offset from primary. */
export function newRoleBase(primaryBase: string, role: LinkedRole): string {
  const base = hexToOklch(primaryBase);
  return oklchToHex({ ...base, h: rotate(base.h, NEW_ROLE_HUE_OFFSET[role]) });
}

/**
 * Hue offsets for the wheel diagram, primary first. `mono` returns three zeros
 * because it desaturates rather than rotating — the diagram shows that as three
 * concentric dots on one spoke.
 */
export function harmonyAngles(rule: HarmonyRule): [number, number, number] {
  return [0, HARMONY_OFFSETS[rule].secondary, HARMONY_OFFSETS[rule].tertiary];
}

/** The three swatches a harmony option shows in the dropdown. */
export function harmonyPreview(
  primaryBase: string,
  rule: HarmonyRule
): Record<ScaleRole, string> {
  return {
    primary: normalizeHex(primaryBase) ?? primaryBase,
    secondary: harmonizeBase(primaryBase, "secondary", rule),
    tertiary: harmonizeBase(primaryBase, "tertiary", rule),
  };
}
