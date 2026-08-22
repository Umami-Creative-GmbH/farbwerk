/**
 * Palette state: three roles, the controls that shape each one, and the pure
 * reducer behind them.
 *
 * Derivation is read-time on purpose. A linked role stores its own fields but
 * its base is recomputed from primary every time it is read, so editing primary
 * re-derives every linked role everywhere at once.
 */
import { normalizeHex, oklchToHex } from "@/lib/color/convert";
import type { ExportRole } from "@/lib/color/export";
import {
  type HarmonyRule,
  type HarmonySetting,
  newRoleBase,
  resolveRoleBase,
} from "@/lib/color/harmony";
import {
  type AnchorSetting,
  buildScale,
  resolveAnchorStep,
} from "@/lib/color/scale";
import type { PaletteScales } from "@/lib/color/tokens";
import type {
  ColorScale,
  LinkedRole,
  ScaleKey,
  ScaleRole,
} from "@/lib/color/types";

export interface RoleFields {
  anchor: AnchorSetting;
  base: string;
  chroma: number;
  harmony: HarmonySetting;
  hueShift: number;
  name: string;
  overrides: Partial<Record<ScaleKey, string>>;
  spread: number;
}

export interface PaletteState {
  /** The role the sidebar controls are currently editing. */
  active: ScaleRole;
  roles: Record<ScaleRole, RoleFields | null> & { primary: RoleFields };
}

export const DEFAULT_BASE = "#0078d2";
/**
 * Roles start unnamed. Anything that displays or exports a name falls back to
 * the nearest catalogue name for the base — see `useRoleNames`.
 */
export const DEFAULT_NAME = "";

/** Which sliders sit on a role, so the reducer can move one by name. */
export type RampControl = "chroma" | "hueShift" | "spread";

export type PaletteAction =
  | { type: "setActive"; role: ScaleRole }
  | { type: "setName"; name: string }
  | { type: "setBase"; base: string }
  | { type: "setControl"; control: RampControl; value: number }
  | { type: "setAnchor"; anchor: AnchorSetting }
  | { type: "setHarmony"; harmony: HarmonySetting }
  | { type: "setOverride"; step: ScaleKey; hex: string | null }
  | { type: "resetOverrides" }
  | { type: "addRole"; role: LinkedRole }
  | { type: "removeRole"; role: LinkedRole }
  | { type: "makePrimary"; role: LinkedRole }
  | { type: "randomize"; base: string }
  | { type: "loadState"; state: PaletteState }
  | { type: "generate"; rule: HarmonyRule }
  | { type: "applyExtracted"; picks: ExtractedPicks };

/**
 * Bases lifted off an image, one per role. Primary is what makes the whole
 * thing worth applying; the other two are there when the image had more to
 * give, and stay untouched when they are absent.
 */
export interface ExtractedPicks {
  primary: string;
  secondary?: string | null;
  tertiary?: string | null;
}

export function createRole(name: string, base: string): RoleFields {
  return {
    anchor: "auto",
    base,
    chroma: 1,
    harmony: "auto",
    hueShift: 0,
    name,
    overrides: {},
    spread: 1,
  };
}

export function initialPaletteState(
  base: string = DEFAULT_BASE,
  name: string = DEFAULT_NAME
): PaletteState {
  return {
    active: "primary",
    roles: { primary: createRole(name, base), secondary: null, tertiary: null },
  };
}

const RANDOM_LIGHTNESS = 0.637;
const RANDOM_MIN_CHROMA = 0.13;
const RANDOM_CHROMA_RANGE = 0.12;
const FULL_TURN = 360;

/** A fresh, usably saturated base — what the Random button hands over. */
export function randomBase(): string {
  return oklchToHex({
    c: RANDOM_MIN_CHROMA + Math.random() * RANDOM_CHROMA_RANGE,
    h: Math.random() * FULL_TURN,
    l: RANDOM_LIGHTNESS,
  });
}

/** The fields a role renders with right now, after harmony derivation. */
export function fieldsFor(
  state: PaletteState,
  role: ScaleRole
): RoleFields | null {
  const fields = state.roles[role];
  if (!fields) {
    return null;
  }
  return {
    ...fields,
    base: resolveRoleBase({
      base: fields.base,
      harmony: fields.harmony,
      primaryBase: state.roles.primary.base,
      role,
    }),
  };
}

export function scaleFor(
  state: PaletteState,
  role: ScaleRole
): ColorScale | null {
  const fields = fieldsFor(state, role);
  return fields ? buildScale(fields) : null;
}

/** Every present role's ramp, ready for `galleryVars`. */
export function paletteScales(state: PaletteState): PaletteScales {
  return {
    primary: scaleFor(state, "primary") as ColorScale,
    secondary: scaleFor(state, "secondary"),
    tertiary: scaleFor(state, "tertiary"),
  };
}

/** The three roles in display order. */
export const SCALE_ROLES: readonly ScaleRole[] = [
  "primary",
  "secondary",
  "tertiary",
];

/**
 * Present roles, named and rendered — what every export format consumes.
 *
 * `names` carries the resolved display name per role (typed, else the nearest
 * catalogue name); anything missing falls back to the role itself.
 */
export function exportRoles(
  state: PaletteState,
  names?: Partial<Record<ScaleRole, string | null>>
): ExportRole[] {
  const roles: ExportRole[] = [];
  for (const role of SCALE_ROLES) {
    const fields = fieldsFor(state, role);
    const scale = scaleFor(state, role);
    if (fields && scale) {
      roles.push({ name: names?.[role] || fields.name || role, scale });
    }
  }
  return roles;
}

export function anchorStepFor(
  state: PaletteState,
  role: ScaleRole
): ScaleKey | null {
  const fields = fieldsFor(state, role);
  return fields ? resolveAnchorStep(fields.base, fields.anchor) : null;
}

function updateActive(
  state: PaletteState,
  change: Partial<RoleFields>
): PaletteState {
  const current = state.roles[state.active];
  if (!current) {
    return state;
  }
  return {
    ...state,
    roles: { ...state.roles, [state.active]: { ...current, ...change } },
  };
}

function withRandomBase(state: PaletteState, base: string): PaletteState {
  // Randomising re-rolls primary; linked roles follow through derivation.
  return {
    ...state,
    active: "primary",
    roles: {
      ...state.roles,
      primary: { ...state.roles.primary, base, harmony: "manual" },
    },
  };
}

/**
 * Apply one harmony rule to the whole palette: both linked roles are created if
 * missing and pointed at the rule, so a single click turns one base into three
 * related scales.
 */
function generate(state: PaletteState, rule: HarmonyRule): PaletteState {
  const link = (role: LinkedRole): RoleFields => ({
    ...(state.roles[role] ??
      createRole("", newRoleBase(state.roles.primary.base, role))),
    harmony: rule,
  });

  return {
    ...state,
    roles: {
      ...state.roles,
      secondary: link("secondary"),
      tertiary: link("tertiary"),
    },
  };
}

function addRole(state: PaletteState, role: LinkedRole): PaletteState {
  if (state.roles[role]) {
    return { ...state, active: role };
  }
  const base = newRoleBase(state.roles.primary.base, role);
  return {
    ...state,
    active: role,
    roles: { ...state.roles, [role]: createRole("", base) },
  };
}

function removeRole(state: PaletteState, role: LinkedRole): PaletteState {
  const roles = { ...state.roles, [role]: null };
  // Dropping tertiary along with secondary would surprise; only the row goes.
  return {
    ...state,
    active: state.active === role ? "primary" : state.active,
    roles,
  };
}

/**
 * Swap a role with primary. Both become manual, because after the swap neither
 * base is derivable from the other any more.
 */
function makePrimary(state: PaletteState, role: LinkedRole): PaletteState {
  const promoted = fieldsFor(state, role);
  if (!promoted) {
    return state;
  }
  return {
    ...state,
    active: "primary",
    roles: {
      ...state.roles,
      primary: { ...promoted, harmony: "manual" },
      [role]: { ...state.roles.primary, harmony: "manual" },
    },
  };
}

/**
 * Point one role at a color taken from an image.
 *
 * The base is the user's choice now, so the role goes manual and its per-step
 * edits are dropped — they were tuned against the old ramp and would fight the
 * new one. A role with no pick is returned untouched.
 */
function withExtractedBase(
  fields: RoleFields | null,
  pick: string | null | undefined
): RoleFields | null {
  const base = pick ? normalizeHex(pick) : null;
  if (!base) {
    return fields;
  }
  return {
    ...(fields ?? createRole(DEFAULT_NAME, base)),
    base,
    harmony: "manual",
    overrides: {},
  };
}

/**
 * Apply an extraction to the palette. Secondary and tertiary are created when
 * the picker assigned them and left alone when it did not, so lifting a single
 * brand color out of a logo never quietly discards the rest of the palette.
 */
function applyExtracted(
  state: PaletteState,
  picks: ExtractedPicks
): PaletteState {
  const primary =
    withExtractedBase(state.roles.primary, picks.primary) ??
    state.roles.primary;

  return {
    ...state,
    active: "primary",
    roles: {
      primary,
      secondary: withExtractedBase(state.roles.secondary, picks.secondary),
      tertiary: withExtractedBase(state.roles.tertiary, picks.tertiary),
    },
  };
}

function setOverride(
  state: PaletteState,
  step: ScaleKey,
  hex: string | null
): PaletteState {
  const current = state.roles[state.active];
  if (!current) {
    return state;
  }
  const overrides = { ...current.overrides };
  if (hex === null) {
    delete overrides[step];
  } else {
    overrides[step] = normalizeHex(hex) ?? hex;
  }
  return updateActive(state, { overrides });
}

export function paletteReducer(
  state: PaletteState,
  action: PaletteAction
): PaletteState {
  switch (action.type) {
    case "setActive":
      return state.roles[action.role]
        ? { ...state, active: action.role }
        : state;
    case "setName":
      return updateActive(state, { name: action.name });
    case "setBase":
      // Typing a hex breaks the link to primary — the role is now the user's.
      return updateActive(state, { base: action.base, harmony: "manual" });
    case "setControl":
      return updateActive(state, { [action.control]: action.value });
    case "setAnchor":
      return updateActive(state, { anchor: action.anchor });
    case "setHarmony":
      return updateActive(state, { harmony: action.harmony });
    case "setOverride":
      return setOverride(state, action.step, action.hex);
    case "resetOverrides":
      return updateActive(state, { overrides: {} });
    case "addRole":
      return addRole(state, action.role);
    case "removeRole":
      return removeRole(state, action.role);
    case "makePrimary":
      return makePrimary(state, action.role);
    case "randomize":
      return withRandomBase(state, action.base);
    case "loadState":
      return action.state;
    case "generate":
      return generate(state, action.rule);
    case "applyExtracted":
      return applyExtracted(state, action.picks);
    default:
      return state;
  }
}
