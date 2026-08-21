/**
 * The 11-step swatch strip.
 *
 * The anchor step is called out: `detected` when it was inferred from the
 * base's lightness, `forced` when the user pinned it. Names come from the
 * server function, so they arrive a moment after the colors do.
 */

import { type MouseEvent, useCallback } from "react";
import { usePalette } from "@/components/palette/palette-context";
import { useColorNames } from "@/hooks/use-color-names";
import { readableInk } from "@/lib/color/contrast";
import { STEP_TAGS } from "@/lib/color/scale";
import { SCALE_KEYS, type ScaleKey } from "@/lib/color/types";
import { cn } from "@/lib/utils";

export interface ScaleStripProps {
  className?: string;
  onSelect?: (step: ScaleKey) => void;
  selected?: ScaleKey;
}

export function ScaleStrip({ selected, onSelect, className }: ScaleStripProps) {
  const { scale, anchorStep, detectedStep, fieldsFor, state } = usePalette();
  const active = fieldsFor(state.active);
  const isForced = active?.anchor !== "auto";
  const names = useColorNames(SCALE_KEYS.map((key) => scale[key]));

  // One handler for all eleven swatches — the step rides along on the element.
  const handleSelect = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const step = Number(event.currentTarget.dataset.step);
      onSelect?.(step as ScaleKey);
    },
    [onSelect]
  );

  return (
    <div className={cn("flex w-full gap-1", className)}>
      {SCALE_KEYS.map((key) => {
        const hex = scale[key];
        const ink = readableInk(hex);
        const isAnchor = key === anchorStep;
        return (
          <button
            aria-current={key === selected}
            className={cn(
              "flex min-w-0 flex-1 flex-col gap-1 rounded-md px-2 py-3 text-left transition-colors",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
              isAnchor && "ring-2 ring-foreground ring-offset-2"
            )}
            data-step={key}
            key={key}
            onClick={handleSelect}
            style={{ background: hex, color: ink }}
            title={names[hex] ?? hex}
            type="button"
          >
            <span className="font-mono text-xs tabular-nums">{key}</span>
            <span className="truncate font-mono text-[10px] uppercase opacity-80">
              {hex}
            </span>
            <span className="truncate text-[10px] opacity-70">
              {isAnchor
                ? `${isForced ? "forced" : "detected"} · ${STEP_TAGS[key]}`
                : STEP_TAGS[key]}
            </span>
            <span className="truncate text-[10px] opacity-70">
              {names[hex] ?? "…"}
            </span>
          </button>
        );
      })}
      <span className="sr-only">
        Anchor step {anchorStep}, detected {detectedStep}
      </span>
    </div>
  );
}
