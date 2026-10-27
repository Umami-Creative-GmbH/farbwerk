/**
 * The Contrast matrix tab.
 *
 * An 11×11 grid of every step against every other, scored with either APCA
 * (WCAG 3 draft) or the WCAG 2.1 ratio. Passing pairs render as the real color
 * pair so you can read them; failing pairs collapse to a muted tile. Nothing is
 * gated — the threshold only decides what stays legible.
 *
 * The rail's options are radios wearing the reference's row styling: the design
 * draws them as plain buttons, but this is a single-choice control and radio
 * semantics give it arrow-key navigation for free. The grid is a real `<table>`
 * with row and column headers for the same reason — SPEC §11 lists the
 * prototype's wall of divs as an accessibility gap to close, so this matches
 * how it looks, not how it was marked up.
 */
import { useTranslate } from "@tolgee/react";
import { useCallback, useMemo, useState } from "react";

import { usePalette } from "@/components/palette/palette-context";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCopy } from "@/hooks/use-copy";
import {
  APCA_THRESHOLDS,
  contrastMatrix,
  DEFAULT_APCA_THRESHOLD,
  DEFAULT_WCAG_THRESHOLD,
  WCAG_THRESHOLDS,
} from "@/lib/color/contrast";
import type { ContrastAlgorithm } from "@/lib/color/contrast";
import { SCALE_KEYS } from "@/lib/color/types";
import { cn } from "@/lib/utils";

import { SECTION_LABEL } from "./chrome-styles";

/** Sentinel for the "All" option — show every pair, threshold off. */
const ALL = 0;
/** Any real score clears this, which is how "All" passes everything. */
const NO_THRESHOLD = -1;

const APCA_DIGITS = 0;
const WCAG_DIGITS = 1;

/**
 * A selectable row in the rail. The radio itself is visually hidden — the row
 * is the affordance — but it stays in the tree, so the group is still a
 * radiogroup you can arrow through.
 */
const OPTION_ROW = [
  "flex cursor-pointer items-center rounded-[10px] px-3 text-left",
  "text-(--text-body) transition-colors duration-150 ease-out",
  "hover:bg-(--surface-muted)",
  "has-data-checked:bg-(--fw-active-bg) has-data-checked:text-(--fw-active-fg)",
  // The radio is hidden, so the row carries the focus ring for keyboard users.
  "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--ring)]",
].join(" ");

/**
 * `size-px` alongside `sr-only`: the radio's own `size-4` is a different
 * utility group, so sr-only alone leaves a 16px box in the row and pushes the
 * label off the design's 12px inset.
 */
const HIDDEN_RADIO = "sr-only size-px";

const GUIDELINE_ROW = `${OPTION_ROW} py-2.5 font-heading text-[13px]`;
const THRESHOLD_ROW = `${OPTION_ROW} py-2 font-mono text-[12.5px]`;

/** Spelled out, not composed, so `tolgee extract` can see the keys. */
function useThresholdNotes(): Record<
  ContrastAlgorithm,
  Record<number, string>
> {
  const { t } = useTranslate();

  return {
    apca: {
      15: t("matrix.note-apca-15"),
      30: t("matrix.note-apca-30"),
      45: t("matrix.note-apca-45"),
      60: t("matrix.note-apca-60"),
      75: t("matrix.note-apca-75"),
      90: t("matrix.note-apca-90"),
    },
    wcag: {
      3: t("matrix.note-wcag-3"),
      4.5: t("matrix.note-wcag-4.5"),
      7: t("matrix.note-wcag-7"),
    },
  };
}

export function ContrastMatrixTab() {
  const { t } = useTranslate();
  const { scale } = usePalette();
  const copy = useCopy();
  const notes = useThresholdNotes();
  const [algorithm, setAlgorithm] = useState<ContrastAlgorithm>("apca");
  const [threshold, setThreshold] = useState<number>(DEFAULT_APCA_THRESHOLD);

  const isApca = algorithm === "apca";
  const levels = isApca ? APCA_THRESHOLDS : WCAG_THRESHOLDS;
  const note =
    threshold === ALL ? t("matrix.note-all") : notes[algorithm][threshold];

  const cells = useMemo(
    () =>
      contrastMatrix(
        scale,
        algorithm,
        threshold === ALL ? NO_THRESHOLD : threshold
      ),
    [scale, algorithm, threshold]
  );

  const changeAlgorithm = useCallback((next: string) => {
    const value = next as ContrastAlgorithm;
    setAlgorithm(value);
    setThreshold(
      value === "apca" ? DEFAULT_APCA_THRESHOLD : DEFAULT_WCAG_THRESHOLD
    );
  }, []);

  const changeThreshold = useCallback((next: string | null) => {
    if (next !== null) {
      setThreshold(Number(next));
    }
  }, []);

  const handleCopy = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const { pair, label } = event.currentTarget.dataset;
      if (pair && label) {
        copy(pair, label);
      }
    },
    [copy]
  );

  return (
    <div className="grid items-start lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
      <aside className="grid min-w-0 content-start gap-6 py-6 lg:border-r lg:border-(--border-subtle) lg:pr-5">
        <fieldset>
          <legend className={SECTION_LABEL}>{t("matrix.guidelines")}</legend>
          <RadioGroup
            className="mt-2.5 grid gap-0.75"
            onValueChange={changeAlgorithm}
            value={algorithm}
          >
            <label className={GUIDELINE_ROW} htmlFor="guideline-apca">
              <RadioGroupItem
                className={HIDDEN_RADIO}
                id="guideline-apca"
                value="apca"
              />
              WCAG 3 ⦁ APCA
            </label>
            <label className={GUIDELINE_ROW} htmlFor="guideline-wcag">
              <RadioGroupItem
                className={HIDDEN_RADIO}
                id="guideline-wcag"
                value="wcag"
              />
              WCAG 2
            </label>
          </RadioGroup>
        </fieldset>

        <fieldset>
          <legend className={SECTION_LABEL}>{t("matrix.threshold")}</legend>
          <RadioGroup
            className="mt-2.5 grid gap-0.5"
            onValueChange={changeThreshold}
            value={String(threshold)}
          >
            {levels.map((level) => (
              <label
                className={THRESHOLD_ROW}
                htmlFor={`threshold-${level}`}
                key={level}
              >
                <RadioGroupItem
                  className={HIDDEN_RADIO}
                  id={`threshold-${level}`}
                  value={String(level)}
                />
                {isApca ? `Lc ${level}` : `${level}:1`}
              </label>
            ))}
            <label className={THRESHOLD_ROW} htmlFor="threshold-all">
              <RadioGroupItem
                className={HIDDEN_RADIO}
                id="threshold-all"
                value={String(ALL)}
              />
              {t("matrix.all")}
            </label>
          </RadioGroup>
        </fieldset>

        <p className="border-t border-(--border-subtle) pt-4 text-[12.5px] leading-[1.55] text-(--text-muted)">
          {note}
        </p>
      </aside>

      <div className="min-w-0 overflow-x-auto py-6 lg:pl-6">
        <table className="w-full min-w-125 border-separate border-spacing-0.75 text-center font-mono">
          <caption className="sr-only">{t("matrix.caption")}</caption>
          <thead>
            <tr>
              <th
                className="w-10.5 text-[10px] font-normal text-(--text-muted)"
                scope="col"
              >
                <span className="sr-only">{t("matrix.text-step")}</span>
              </th>
              {SCALE_KEYS.map((key) => (
                <th
                  className="pb-1.5 text-[10px] font-normal text-(--text-muted)"
                  key={key}
                  scope="col"
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cells.map((row, index) => (
              <tr key={SCALE_KEYS[index]}>
                <th
                  className="text-left text-[10px] font-normal text-(--text-muted)"
                  scope="row"
                >
                  {SCALE_KEYS[index]}
                </th>
                {row.map((cell) => {
                  if (cell.isDiagonal) {
                    return <td key={cell.background} />;
                  }

                  if (!cell.passes) {
                    return (
                      <td
                        className="h-9 rounded-[9px] bg-(--surface-muted) text-[10.5px] text-(--text-muted) opacity-60"
                        key={cell.background}
                      >
                        ·
                      </td>
                    );
                  }

                  const reading = cell.value.toFixed(
                    isApca ? APCA_DIGITS : WCAG_DIGITS
                  );
                  return (
                    <td className="p-0" key={cell.background}>
                      <button
                        className={cn(
                          "flex h-9 w-full cursor-pointer items-center justify-center rounded-[9px] text-[10.5px] tabular-nums",
                          "transition-transform duration-150 ease-out hover:scale-105"
                        )}
                        data-label={`${cell.text} on ${cell.background}`}
                        data-pair={`${cell.textHex} on ${cell.backgroundHex}`}
                        onClick={handleCopy}
                        style={{
                          background: cell.backgroundHex,
                          color: cell.textHex,
                        }}
                        title={`${cell.text} on ${cell.background}: ${reading}`}
                        type="button"
                      >
                        {reading}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
