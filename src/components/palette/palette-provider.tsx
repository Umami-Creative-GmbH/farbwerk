import { type ReactNode, useMemo, useReducer } from "react";
import { detectAnchorStep, resolveAnchorStep } from "@/lib/color/scale";
import type { ColorScale } from "@/lib/color/types";
import {
  DEFAULT_BASE,
  DEFAULT_NAME,
  fieldsFor as deriveFields,
  scaleFor as deriveScale,
  initialPaletteState,
  paletteReducer,
  paletteScales,
} from "@/lib/palette/state";
import { PaletteContext, type PaletteContextValue } from "./palette-context";

export interface PaletteProviderProps {
  /** Initial base color, matching the prototype's `defaultBase` prop. */
  base?: string;
  children: ReactNode;
  name?: string;
}

export function PaletteProvider({
  children,
  base = DEFAULT_BASE,
  name = DEFAULT_NAME,
}: PaletteProviderProps) {
  const [state, dispatch] = useReducer(paletteReducer, undefined, () =>
    initialPaletteState(base, name)
  );

  const value = useMemo<PaletteContextValue>(() => {
    const active = deriveFields(state, state.active) ?? state.roles.primary;
    return {
      anchorStep: resolveAnchorStep(active.base, active.anchor),
      detectedStep: detectAnchorStep(active.base),
      dispatch,
      fieldsFor: (role) => deriveFields(state, role),
      scale: deriveScale(state, state.active) as ColorScale,
      scaleFor: (role) => deriveScale(state, role),
      scales: paletteScales(state),
      state,
    };
  }, [state]);

  return <PaletteContext value={value}>{children}</PaletteContext>;
}
