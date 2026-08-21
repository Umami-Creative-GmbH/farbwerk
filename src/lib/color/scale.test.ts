import { describe, expect, it } from "vitest";
import { hexToOklch } from "./convert";
import {
  buildScale,
  detectAnchorStep,
  LIGHTNESS_TARGETS,
  resolveAnchorStep,
} from "./scale";
import { SCALE_KEYS } from "./types";

const HEX = /^#[0-9a-f]{6}$/;
const INVALID_BASE = /Not a valid base color/;

describe("detectAnchorStep", () => {
  it("picks the step whose canonical lightness is closest", () => {
    expect(detectAnchorStep("#0078d2")).toBe(600);
    expect(detectAnchorStep("#f5f9ff")).toBe(50);
    expect(detectAnchorStep("#04070f")).toBe(950);
  });

  it("never forces the base to 500", () => {
    expect(detectAnchorStep("#e60096")).not.toBe(600);
    expect(detectAnchorStep("#e60096")).toBe(500);
  });

  it("honours an explicit anchor", () => {
    expect(resolveAnchorStep("#0078d2", 300)).toBe(300);
    expect(resolveAnchorStep("#0078d2", "auto")).toBe(600);
  });
});

describe("buildScale", () => {
  it("emits all 11 steps as 6-digit hex", () => {
    const scale = buildScale({ base: "#0078d2" });
    expect(Object.keys(scale)).toHaveLength(SCALE_KEYS.length);
    for (const key of SCALE_KEYS) {
      expect(scale[key]).toMatch(HEX);
    }
  });

  it("keeps the base verbatim at its anchor step", () => {
    expect(buildScale({ base: "#0078d2" })[600]).toBe("#0078d2");
    expect(buildScale({ anchor: 300, base: "#0078d2" })[300]).toBe("#0078d2");
  });

  it("gets darker with every step", () => {
    const scale = buildScale({ base: "#0078d2" });
    const lightness = SCALE_KEYS.map((key) => hexToOklch(scale[key]).l);
    for (let i = 1; i < lightness.length; i += 1) {
      expect(lightness[i]).toBeLessThan(lightness[i - 1]);
    }
  });

  it("tracks the canonical ramp when the base sits at its step's lightness", () => {
    const scale = buildScale({ anchor: 500, base: "#428fdb" });
    expect(hexToOklch(scale[100]).l).toBeCloseTo(LIGHTNESS_TARGETS[100], 1);
    expect(hexToOklch(scale[900]).l).toBeCloseTo(LIGHTNESS_TARGETS[900], 1);
  });

  it("does not collapse steps on an extreme base", () => {
    for (const base of ["#04070f", "#f5f9ff", "#000000", "#ffffff"]) {
      const scale = buildScale({ base });
      expect(new Set(Object.values(scale)).size).toBe(SCALE_KEYS.length);
    }
  });

  it("scales chroma by the chroma multiplier", () => {
    const plain = buildScale({ base: "#0078d2" });
    const muted = buildScale({ base: "#0078d2", chroma: 0.4 });
    expect(hexToOklch(muted[300]).c).toBeLessThan(hexToOklch(plain[300]).c);
  });

  it("drifts hue by hueShift degrees per five steps", () => {
    const scale = buildScale({ anchor: 500, base: "#0078d2", hueShift: 20 });
    const anchorHue = hexToOklch(scale[500]).h;
    // 950 is five steps below 500, so a full hueShift of drift.
    expect(hexToOklch(scale[950]).h - anchorHue).toBeCloseTo(20, 0);
  });

  it("takes manual overrides verbatim", () => {
    const scale = buildScale({
      base: "#0078d2",
      overrides: { 200: "#ABCDEF" },
    });
    expect(scale[200]).toBe("#abcdef");
    expect(scale[300]).not.toBe("#abcdef");
  });

  it("rejects a base that is not a hex color", () => {
    expect(() => buildScale({ base: "not-a-color" })).toThrow(INVALID_BASE);
  });
});
