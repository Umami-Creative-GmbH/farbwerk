import { useMemo, useReducer } from "react";
import type { ReactNode } from "react";

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
  rampSignature,
} from "@/lib/palette/state";

import { PaletteContext } from "./palette-context";
import type { PaletteContextValue } from "./palette-context";

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

  /**
   * The ramps are memoised on what builds them, not on the state object.
   *
   * `setName` and `setActive` replace that object without touching a color, and
   * handing out a fresh `scales` there repaints the whole gallery — recharts
   * included — for nothing. Keyed on the signature instead, typing a role name
   * leaves scale identity alone and the gallery's own memos hold.
   */
  const rampKey = rampSignature(state);
  // biome-ignore lint/correctness/useExhaustiveDependencies: rampKey is a value signature of every field the ramps read.
  const scales = useMemo(() => paletteScales(state), [rampKey]);

  const value = useMemo<PaletteContextValue>(() => {
    const active = deriveFields(state, state.active) ?? state.roles.primary;
    return {
      anchorStep: resolveAnchorStep(active.base, active.anchor),
      detectedStep: detectAnchorStep(active.base),
      dispatch,
      fieldsFor: (role) => deriveFields(state, role),
      scale: deriveScale(state, state.active) as ColorScale,
      scaleFor: (role) => deriveScale(state, role),
      scales,
      state,
    };
  }, [state, scales]);

  return <PaletteContext value={value}>{children}</PaletteContext>;
}
