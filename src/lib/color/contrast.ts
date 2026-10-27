/**
 * Contrast scoring for the matrix and the color info table.
 *
 * Two guidelines, side by side:
 * - APCA (WCAG 3 draft) via colorjs.io's APCA 0.0.98G implementation — the
 *   polarity-aware Lc score. Signed: positive for dark text on a light
 *   background, negative when inverted.
 * - WCAG 2.1 relative-luminance ratio, symmetric, 1–21.
 */
import { contrastAPCA, contrastWCAG21 } from "colorjs.io/fn";

import { parseHexColor } from "./convert";
import { SCALE_KEYS } from "./types";
import type { ColorScale, ScaleKey } from "./types";

export type ContrastAlgorithm = "apca" | "wcag";

/** Lc levels offered in the matrix rail. */
export const APCA_THRESHOLDS = [15, 30, 45, 60, 75, 90] as const;
/** WCAG 2 ratios offered in the matrix rail. */
export const WCAG_THRESHOLDS = [3, 4.5, 7] as const;

export const DEFAULT_APCA_THRESHOLD = 45;
export const DEFAULT_WCAG_THRESHOLD = 4.5;

const AAA_RATIO = 7;
const AA_RATIO = 4.5;
const AA_LARGE_RATIO = 3;

/** Below this ratio against white, a swatch needs dark ink. */
const READABLE_INK_RATIO = 3.4;
const INK_LIGHT = "#ffffff";
const INK_DARK = "#0b1428";

/**
 * APCA lightness contrast, signed. Argument order matches how you read it:
 * text first, background second.
 */
export function apcaContrast(text: string, background: string): number {
  return contrastAPCA(parseHexColor(background), parseHexColor(text));
}

/** WCAG 2.1 contrast ratio, 1–21. Symmetric, so order does not matter. */
export function wcagContrast(a: string, b: string): number {
  return contrastWCAG21(parseHexColor(a), parseHexColor(b));
}

export function passesApca(
  text: string,
  background: string,
  threshold: number = DEFAULT_APCA_THRESHOLD
): boolean {
  return Math.abs(apcaContrast(text, background)) >= threshold;
}

export function passesWcag(
  a: string,
  b: string,
  threshold: number = DEFAULT_WCAG_THRESHOLD
): boolean {
  return wcagContrast(a, b) >= threshold;
}

export type WcagGrade = "AAA" | "AA" | "AA large" | "fail";

export function wcagGrade(ratio: number): WcagGrade {
  if (ratio >= AAA_RATIO) {
    return "AAA";
  }
  if (ratio >= AA_RATIO) {
    return "AA";
  }
  if (ratio >= AA_LARGE_RATIO) {
    return "AA large";
  }
  return "fail";
}

/** Pick white or near-black ink for text sitting on `background`. */
export function readableInk(background: string): string {
  return wcagContrast(INK_LIGHT, background) >= READABLE_INK_RATIO
    ? INK_LIGHT
    : INK_DARK;
}

export interface ContrastCell {
  background: ScaleKey;
  backgroundHex: string;
  /** A step against itself — rendered blank. */
  isDiagonal: boolean;
  passes: boolean;
  text: ScaleKey;
  textHex: string;
  /** Lc for APCA, ratio for WCAG. */
  value: number;
}

/**
 * The 11×11 grid behind the Contrast matrix tab. Rows are text steps, columns
 * are background steps.
 */
export function contrastMatrix(
  scale: ColorScale,
  algorithm: ContrastAlgorithm = "apca",
  threshold?: number
): ContrastCell[][] {
  const level =
    threshold ??
    (algorithm === "apca" ? DEFAULT_APCA_THRESHOLD : DEFAULT_WCAG_THRESHOLD);

  return SCALE_KEYS.map((text) =>
    SCALE_KEYS.map((background) => {
      const textHex = scale[text];
      const backgroundHex = scale[background];
      const isDiagonal = text === background;
      const value =
        algorithm === "apca"
          ? apcaContrast(textHex, backgroundHex)
          : wcagContrast(textHex, backgroundHex);
      return {
        background,
        backgroundHex,
        isDiagonal,
        passes: !isDiagonal && Math.abs(value) >= level,
        text,
        textHex,
        value,
      };
    })
  );
}
