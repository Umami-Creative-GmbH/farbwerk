import { createContext, use } from "react";
import type { PaletteScales } from "@/lib/color/tokens";
import type { ColorScale, ScaleKey, ScaleRole } from "@/lib/color/types";
import type {
  PaletteAction,
  PaletteState,
  RoleFields,
} from "@/lib/palette/state";

export interface PaletteContextValue {
  anchorStep: ScaleKey;
  detectedStep: ScaleKey;
  dispatch: (action: PaletteAction) => void;
  /** Fields after harmony derivation — never read `state.roles` directly. */
  fieldsFor: (role: ScaleRole) => RoleFields | null;
  /** The active role's ramp, which the strip and the tabs render. */
  scale: ColorScale;
  scaleFor: (role: ScaleRole) => ColorScale | null;
  scales: PaletteScales;
  state: PaletteState;
}

export const PaletteContext = createContext<PaletteContextValue | null>(null);

export function usePalette(): PaletteContextValue {
  const value = use(PaletteContext);
  if (!value) {
    throw new Error("usePalette must be used inside a PaletteProvider");
  }
  return value;
}
