import { describe, expect, it } from "vitest";

const HEX = /^#[0-9a-f]{6}$/;

import {
  clampToSrgb,
  formatColor,
  hexToOklch,
  hexToRgb,
  isInSrgbGamut,
  normalizeHex,
  oklchToHex,
  rgbToHex,
} from "./convert";

describe(normalizeHex, () => {
  it("expands shorthand and lowercases", () => {
    expect(normalizeHex("#08D")).toBe("#0088dd");
    expect(normalizeHex("0078D2")).toBe("#0078d2");
    expect(normalizeHex("  #0078d2  ")).toBe("#0078d2");
  });

  it("rejects anything that is not a hex color", () => {
    expect(normalizeHex("rebeccapurple")).toBeNull();
    expect(normalizeHex("#12345")).toBeNull();
    expect(normalizeHex("")).toBeNull();
  });
});

describe(hexToOklch, () => {
  it("converts to the expected OKLCH triple", () => {
    const { l, c, h } = hexToOklch("#0078d2");
    expect(l).toBeCloseTo(0.566, 3);
    expect(c).toBeCloseTo(0.164, 3);
    expect(h).toBeCloseTo(250.86, 2);
  });

  it("reports hue 0 for achromatic colors instead of NaN", () => {
    expect(hexToOklch("#808080").h).toBe(0);
  });

  it("round-trips through oklchToHex", () => {
    for (const hex of ["#0078d2", "#e60096", "#ff8900", "#00d4a8", "#122143"]) {
      expect(oklchToHex(hexToOklch(hex))).toBe(hex);
    }
  });
});

describe("gamut mapping", () => {
  const unreachable = { c: 0.4, h: 250, l: 0.6 };

  it("knows when a triple is outside sRGB", () => {
    expect(isInSrgbGamut(unreachable)).toBe(false);
    expect(isInSrgbGamut(hexToOklch("#0078d2"))).toBe(true);
  });

  it("maps into range instead of clipping to garbage", () => {
    const mapped = clampToSrgb(unreachable);
    expect(isInSrgbGamut(mapped)).toBe(true);
    expect(mapped.c).toBeLessThan(unreachable.c);
    expect(oklchToHex(unreachable)).toMatch(HEX);
  });

  it("keeps more chroma with the css method than with clipping", () => {
    expect(clampToSrgb(unreachable, "css").c).toBeGreaterThan(0);
    expect(isInSrgbGamut(clampToSrgb(unreachable, "chroma"))).toBe(true);
    expect(isInSrgbGamut(clampToSrgb(unreachable, "clip"))).toBe(true);
  });
});

describe("rgb", () => {
  it("converts both ways", () => {
    expect(hexToRgb("#0078d2")).toEqual([0, 120, 210]);
    expect(hexToRgb("#ffffff")).toEqual([255, 255, 255]);
    expect(rgbToHex([0, 120, 210])).toBe("#0078d2");
  });
});

describe(formatColor, () => {
  it("renders every notation", () => {
    expect(formatColor("#0078d2", "hex")).toBe("#0078d2");
    expect(formatColor("#0078d2", "rgb")).toBe("rgb(0 120 210)");
    expect(formatColor("#0078d2", "hsl")).toBe("hsl(206 100% 41%)");
    expect(formatColor("#0078d2", "oklch")).toBe("oklch(56.6% 0.164 250.9)");
  });

  it("never emits a NaN hue for grays", () => {
    expect(formatColor("#808080", "hsl")).toBe("hsl(0 0% 50%)");
  });
});
