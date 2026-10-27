import { describe, expect, it } from "vitest";

import {
  apcaContrast,
  contrastMatrix,
  passesApca,
  passesWcag,
  readableInk,
  wcagContrast,
  wcagGrade,
} from "./contrast";
import { buildScale } from "./scale";
import { SCALE_KEYS } from "./types";

describe(wcagContrast, () => {
  it("returns the known extremes", () => {
    expect(wcagContrast("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(wcagContrast("#0078d2", "#0078d2")).toBeCloseTo(1, 5);
  });

  it("is symmetric", () => {
    expect(wcagContrast("#0078d2", "#ffffff")).toBeCloseTo(
      wcagContrast("#ffffff", "#0078d2"),
      10
    );
  });

  it("grades against the WCAG 2 levels", () => {
    expect(wcagGrade(21)).toBe("AAA");
    expect(wcagGrade(4.5)).toBe("AA");
    expect(wcagGrade(3)).toBe("AA large");
    expect(wcagGrade(2.9)).toBe("fail");
  });
});

describe(apcaContrast, () => {
  it("matches the reference Lc values for black and white", () => {
    expect(apcaContrast("#000000", "#ffffff")).toBeCloseTo(106.04, 2);
    expect(apcaContrast("#ffffff", "#000000")).toBeCloseTo(-107.88, 2);
  });

  it("is signed by polarity, unlike WCAG", () => {
    expect(apcaContrast("#0b1428", "#ffffff")).toBeGreaterThan(0);
    expect(apcaContrast("#ffffff", "#0b1428")).toBeLessThan(0);
  });

  it("scores an identical pair as zero", () => {
    expect(apcaContrast("#0078d2", "#0078d2")).toBe(0);
  });
});

describe("thresholds", () => {
  it("tests the absolute Lc, so polarity does not decide a pass", () => {
    expect(passesApca("#ffffff", "#000000", 90)).toBe(true);
    expect(passesApca("#000000", "#ffffff", 90)).toBe(true);
    expect(passesApca("#0078d2", "#0084e6", 45)).toBe(false);
  });

  it("tests WCAG ratios against the level", () => {
    expect(passesWcag("#000000", "#ffffff", 7)).toBe(true);
    expect(passesWcag("#0078d2", "#0084e6", 4.5)).toBe(false);
  });
});

describe(readableInk, () => {
  it("picks dark ink on light surfaces and white on dark ones", () => {
    expect(readableInk("#ffffff")).toBe("#0b1428");
    expect(readableInk("#f5f9ff")).toBe("#0b1428");
    expect(readableInk("#122143")).toBe("#ffffff");
    expect(readableInk("#0078d2")).toBe("#ffffff");
  });
});

describe(contrastMatrix, () => {
  const scale = buildScale({ base: "#0078d2" });

  it("is 11 by 11 with a blank diagonal", () => {
    const matrix = contrastMatrix(scale);
    expect(matrix).toHaveLength(SCALE_KEYS.length);
    for (const [index, row] of matrix.entries()) {
      expect(row).toHaveLength(SCALE_KEYS.length);
      expect(row[index].isDiagonal).toBe(true);
      expect(row[index].passes).toBe(false);
    }
  });

  it("passes the far corners and fails the near neighbours", () => {
    const matrix = contrastMatrix(scale, "apca", 45);
    const [first] = matrix;
    expect(first.at(-1)?.passes).toBe(true);
    expect(first[1].passes).toBe(false);
  });

  it("switches guideline with the algorithm", () => {
    const wcag = contrastMatrix(scale, "wcag", 4.5);
    expect(wcag[0].at(-1)?.value).toBeGreaterThan(4.5);
    expect(wcag[0].at(-1)?.passes).toBe(true);
  });
});
