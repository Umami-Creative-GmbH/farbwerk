/**
 * The Edit tab.
 *
 * One color input per step, writing straight into the active role's overrides.
 * An overridden step is badged and keeps its value verbatim — the generator
 * skips it entirely — until it is cleared here or by "Reset edits".
 */

import { useTranslate } from "@tolgee/react";
import { RotateCcwIcon, XIcon } from "lucide-react";
import { useCallback, useMemo } from "react";

import { usePalette } from "@/components/palette/palette-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { STEP_TAGS } from "@/lib/color/scale";
import { SCALE_KEYS } from "@/lib/color/types";
import type { ScaleKey } from "@/lib/color/types";

import { ColorSwatchPicker } from "./color-picker-field";

export function ScaleEditorTab() {
  const { t } = useTranslate();
  const { scale, dispatch, fieldsFor, state } = usePalette();
  const active = fieldsFor(state.active);
  const overrides = active?.overrides ?? {};
  const editedCount = Object.keys(overrides).length;

  // One setter per step, built once: the picker hands back a hex, not an
  // event, so there is no element to read the step from.
  const overrideSetters = useMemo(() => {
    const setters = {} as Record<ScaleKey, (hex: string) => void>;
    for (const step of SCALE_KEYS) {
      setters[step] = (hex: string) => {
        dispatch({ hex, step, type: "setOverride" });
      };
    }
    return setters;
  }, [dispatch]);

  const handleClear = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const step = Number(event.currentTarget.dataset.step) as ScaleKey;
      dispatch({ hex: null, step, type: "setOverride" });
    },
    [dispatch]
  );

  const handleReset = useCallback(() => {
    dispatch({ type: "resetOverrides" });
  }, [dispatch]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-muted-foreground text-sm">
          {editedCount === 0
            ? t("edit.none")
            : t("edit.count", { count: editedCount })}
        </p>
        <Button
          disabled={editedCount === 0}
          onClick={handleReset}
          size="sm"
          variant="outline"
        >
          <RotateCcwIcon />
          {t("sidebar.reset-edits")}
        </Button>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SCALE_KEYS.map((step) => {
          const isEdited = Boolean(overrides[step]);
          return (
            <li
              className="border-border flex items-center gap-3 rounded-lg border p-3"
              key={step}
            >
              <ColorSwatchPicker
                className="size-10 rounded-full"
                label={t("edit.step-color", { step })}
                onChange={overrideSetters[step]}
                value={scale[step]}
              />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <Label
                  className="flex items-center gap-2 font-mono text-xs"
                  htmlFor={`edit-step-${step}`}
                >
                  {step}
                  <span className="text-muted-foreground font-sans">
                    {STEP_TAGS[step]}
                  </span>
                  {isEdited ? (
                    <Badge className="px-1.5 py-0 text-[10px]">
                      {t("edit.edited")}
                    </Badge>
                  ) : null}
                </Label>
                <span className="text-muted-foreground truncate font-mono text-xs uppercase">
                  {scale[step]}
                </span>
              </div>
              {isEdited ? (
                <Button
                  aria-label={t("edit.clear")}
                  data-step={step}
                  onClick={handleClear}
                  size="icon"
                  variant="ghost"
                >
                  <XIcon />
                </Button>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
