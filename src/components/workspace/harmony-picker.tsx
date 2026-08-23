/**
 * The harmony rule for a linked role.
 *
 * A row of pills rather than a dropdown — there are only eight rules, and the
 * one you want is usually two away from the one you have. Each pill carries the
 * swatch it would produce, so the choice is visible before it is made.
 *
 * Picking a rule links the role to primary. Typing a hex unlinks it, which
 * shows up here as an extra "Custom" pill.
 */
import { useTranslate } from "@tolgee/react";
import { useCallback } from "react";
import { usePalette } from "@/components/palette/palette-context";
import { useHarmonyCopy } from "@/i18n/labels";
import {
  HARMONY_RULES,
  type HarmonyRule,
  type HarmonySetting,
  harmonizeBase,
} from "@/lib/color/harmony";
import type { LinkedRole } from "@/lib/color/types";
import { cn } from "@/lib/utils";
import { PILL, PILL_ACTIVE, PILL_IDLE, SECTION_LABEL } from "./chrome-styles";

export function HarmonyPicker() {
  const { t } = useTranslate();
  const { state, dispatch, fieldsFor } = usePalette();
  const harmonyCopy = useHarmonyCopy();
  const active = fieldsFor(state.active);
  const primaryBase = state.roles.primary.base;

  const handlePick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const { harmony } = event.currentTarget.dataset;
      if (harmony) {
        dispatch({ harmony: harmony as HarmonySetting, type: "setHarmony" });
      }
    },
    [dispatch]
  );

  if (!active || state.active === "primary") {
    return null;
  }

  const role = state.active as LinkedRole;
  const options: HarmonySetting[] =
    active.harmony === "manual"
      ? [...HARMONY_RULES, "manual"]
      : [...HARMONY_RULES];

  return (
    <div>
      <span className={cn(SECTION_LABEL, "mb-2.5 block")}>
        {t("harmony.label")}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const isActive = active.harmony === option;
          const swatch =
            option === "manual"
              ? active.base
              : harmonizeBase(primaryBase, role, option as HarmonyRule);
          return (
            <button
              className={cn(
                PILL,
                "flex items-center gap-2 px-3 py-1.75",
                isActive ? PILL_ACTIVE : PILL_IDLE
              )}
              data-harmony={option}
              key={option}
              onClick={handlePick}
              title={harmonyCopy[option].hint}
              type="button"
            >
              <span
                aria-hidden="true"
                className="size-2.5 rounded-full"
                style={{ background: swatch }}
              />
              {harmonyCopy[option].name}
            </button>
          );
        })}
      </div>
      <p className="mt-2.5 text-(--text-muted) text-[12.5px] leading-[1.55]">
        {harmonyCopy[active.harmony].hint}
      </p>
    </div>
  );
}
