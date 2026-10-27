/**
 * The 11-step swatch strip.
 *
 * Each step is a card in its own color, tall enough to read as a surface rather
 * than a chip. The small square dot is the design system's one sharp shape; on
 * the anchor step it turns pink, which is how "this is where your base landed"
 * reads without a label competing for the space.
 */
import { useTranslate } from "@tolgee/react";
import { useCallback } from "react";
import type { MouseEvent } from "react";

import { usePalette } from "@/components/palette/palette-context";
import { useColorNames } from "@/hooks/use-color-names";
import { readableInk } from "@/lib/color/contrast";
import { SCALE_KEYS } from "@/lib/color/types";
import type { ScaleKey } from "@/lib/color/types";
import { cn } from "@/lib/utils";

export interface ScaleStripProps {
  className?: string;
  onSelect?: (step: ScaleKey) => void;
  selected?: ScaleKey;
}

export function ScaleStrip({ selected, onSelect, className }: ScaleStripProps) {
  const { t } = useTranslate();
  const { scale, anchorStep, detectedStep, fieldsFor, state } = usePalette();
  const active = fieldsFor(state.active);
  const isForced = active?.anchor !== "auto";
  const anchorLabel = isForced ? t("strip.forced") : t("strip.detected");
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
    <div
      className={cn(
        // py-1, not pb-1: `overflow-x: auto` forces `overflow-y: auto`, so the
        // scroller clips the selection ring unless both edges have its 4px.
        "grid auto-cols-[minmax(58px,1fr)] grid-flow-col gap-1.5 overflow-x-auto py-1",
        className
      )}
    >
      {SCALE_KEYS.map((key) => {
        const hex = scale[key];
        const ink = readableInk(hex);
        const isAnchor = key === anchorStep;
        const isSelected = key === selected;
        return (
          <button
            aria-current={isSelected}
            className={cn(
              "flex min-h-23.5 cursor-pointer flex-col items-start justify-between rounded-[14px] p-2.5 text-left",
              "transition-transform duration-150 ease-out hover:-translate-y-0.5"
            )}
            data-step={key}
            key={key}
            onClick={handleSelect}
            style={{
              background: hex,
              boxShadow: isSelected
                ? `0 0 0 2px var(--surface-subtle), 0 0 0 4px ${ink}`
                : undefined,
              color: ink,
            }}
            title={`${hex}${names[hex] ? ` ⦁ ${names[hex]}` : ""}`}
            type="button"
          >
            <span
              aria-hidden="true"
              className="size-1.75 rounded-[2px]"
              style={{
                background: isAnchor ? "var(--pink-500)" : ink,
                opacity: isAnchor ? 1 : 0.45,
              }}
            />
            <span className="grid w-full gap-0.75">
              <span className="font-heading text-[12px] font-semibold tracking-[0.04em]">
                {key}
              </span>
              <span className="font-mono text-[10.5px] uppercase opacity-80">
                {hex}
              </span>
              {/*
                A non-breaking space, not an empty string: names arrive after a
                debounced round trip, and an empty span collapses to no line
                box — which would resize all eleven cards as they land.
              */}
              <span className="min-h-[1.4em] truncate text-[10px] leading-[1.4] opacity-70">
                {isAnchor ? anchorLabel : (names[hex] ?? " ")}
              </span>
            </span>
          </button>
        );
      })}
      <span className="sr-only">
        {t("strip.summary", { anchor: anchorStep, detected: detectedStep })}
      </span>
    </div>
  );
}
