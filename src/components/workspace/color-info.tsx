/**
 * The Color info tab.
 *
 * All eleven steps at once, one row each: swatch, step key, hex, OKLCH, RGB and
 * the APCA score of that step used as text on white and on navy. Every cell is
 * its own copy button.
 *
 * Layout note: the column gap lives in the cell padding rather than in
 * `column-gap`, so the hairline under a row runs unbroken across it.
 */
import { useTranslate } from "@tolgee/react";
import { useCallback } from "react";
import { usePalette } from "@/components/palette/palette-context";
import { useCopy } from "@/hooks/use-copy";
import { apcaContrast } from "@/lib/color/contrast";
import { formatColor } from "@/lib/color/convert";
import { STEP_TAGS } from "@/lib/color/scale";
import { SCALE_KEYS, type ScaleKey } from "@/lib/color/types";
import { cn } from "@/lib/utils";
import { SECTION_LABEL } from "./chrome-styles";

/** The two surfaces the design system actually puts text on. */
const ON_LIGHT = "#ffffff";
const ON_NAVY = "#122143";

/** Lc at which text reads fluently, and the floor for large text. */
const FLUENT_LC = 75;
const LARGE_TEXT_LC = 45;

const ROW_HEIGHT = "h-11";
const CELL =
  "flex items-center truncate border-border border-b px-3 text-left transition-colors hover:bg-muted/60";

const COLUMNS =
  "grid-cols-[auto_auto_minmax(max-content,1fr)_minmax(max-content,1.4fr)_minmax(max-content,1fr)_auto]";

interface InfoRow {
  hex: string;
  oklch: string;
  onLight: number;
  onNavy: number;
  rgb: string;
  step: ScaleKey;
}

/** The design system's own status colors, not a stray Tailwind palette. */
function chipTone(score: number): string {
  const magnitude = Math.abs(score);
  if (magnitude >= FLUENT_LC) {
    return "bg-[var(--green-100)] text-[var(--green-700)]";
  }
  if (magnitude >= LARGE_TEXT_LC) {
    return "bg-[var(--orange-100)] text-[var(--orange-700)]";
  }
  return "bg-[var(--surface-muted)] text-[var(--text-muted)]";
}

const HEADERS = ["swatch", "step", "hex", "oklch", "rgb", "apca"] as const;

/** Spelled out, not composed, so `tolgee extract` can see the keys. */
function useHeaderLabels(): Record<(typeof HEADERS)[number], string> {
  const { t } = useTranslate();

  return {
    apca: t("info.apca"),
    hex: t("info.hex"),
    oklch: t("info.oklch"),
    rgb: t("info.rgb"),
    step: t("info.step"),
    swatch: t("info.swatch"),
  };
}

export function ColorInfoTab() {
  const { t } = useTranslate();
  const { scale } = usePalette();
  const copy = useCopy();
  const headerLabels = useHeaderLabels();

  const handleCopy = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const { value, label } = event.currentTarget.dataset;
      if (value) {
        copy(value, label);
      }
    },
    [copy]
  );

  const rows: InfoRow[] = SCALE_KEYS.map((step) => {
    const hex = scale[step];
    return {
      hex,
      oklch: formatColor(hex, "oklch"),
      onLight: apcaContrast(hex, ON_LIGHT),
      onNavy: apcaContrast(hex, ON_NAVY),
      rgb: formatColor(hex, "rgb"),
      step,
    };
  });

  return (
    <div className="overflow-x-auto">
      <div className={cn("grid min-w-3xl", COLUMNS)}>
        <div
          className={cn("col-span-full grid grid-cols-subgrid", SECTION_LABEL)}
        >
          {HEADERS.map((header) => (
            <span
              className="border-[var(--border-subtle)] border-b px-3 py-2"
              key={header}
            >
              {headerLabels[header]}
            </span>
          ))}
        </div>

        {rows.map((row) => (
          <div className="col-span-full grid grid-cols-subgrid" key={row.step}>
            <button
              aria-label={t("info.swatch")}
              className={cn(CELL, ROW_HEIGHT)}
              data-label={t("info.step")}
              data-value={row.hex}
              onClick={handleCopy}
              type="button"
            >
              <span
                className="size-6 rounded-[4px] border border-border"
                style={{ background: row.hex }}
              />
            </button>
            <button
              className={cn(CELL, ROW_HEIGHT, "gap-2 font-mono text-xs")}
              data-label={t("info.step")}
              data-value={String(row.step)}
              onClick={handleCopy}
              type="button"
            >
              <span className="tabular-nums">{row.step}</span>
              <span className="text-muted-foreground">
                {STEP_TAGS[row.step]}
              </span>
            </button>
            <button
              className={cn(CELL, ROW_HEIGHT, "font-mono text-xs uppercase")}
              data-label={t("info.hex")}
              data-value={row.hex}
              onClick={handleCopy}
              type="button"
            >
              {row.hex}
            </button>
            <button
              className={cn(CELL, ROW_HEIGHT, "font-mono text-xs")}
              data-label={t("info.oklch")}
              data-value={row.oklch}
              onClick={handleCopy}
              type="button"
            >
              {row.oklch}
            </button>
            <button
              className={cn(CELL, ROW_HEIGHT, "font-mono text-xs")}
              data-label={t("info.rgb")}
              data-value={row.rgb}
              onClick={handleCopy}
              type="button"
            >
              {row.rgb}
            </button>
            <div
              className={cn(
                "flex items-center gap-1.5 border-border border-b px-3",
                ROW_HEIGHT
              )}
            >
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 font-mono text-[10px] tabular-nums",
                  chipTone(row.onLight)
                )}
                title={`Lc ${row.onLight.toFixed(1)} on white`}
              >
                {Math.round(row.onLight)}
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 font-mono text-[10px] tabular-nums",
                  chipTone(row.onNavy)
                )}
                title={`Lc ${row.onNavy.toFixed(1)} on navy`}
              >
                {Math.round(row.onNavy)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
