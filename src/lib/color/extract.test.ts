import { describe, expect, it } from "vitest";
import { hexToOklch, hexToRgb } from "./convert";
import { extractPalette, MAX_EXTRACTED } from "./extract";

const OPAQUE = 255;
const TRANSPARENT = 0;

/**
 * A flat RGBA buffer holding `count` pixels of each hex. Order does not matter
 * to the clustering, but it does to the deterministic seeding, so tests that
 * assert on ranking build the same buffer every time.
 */
function pixels(
  blocks: { count: number; hex: string }[],
  alpha = OPAQUE
): Uint8ClampedArray {
  const data: number[] = [];
  for (const block of blocks) {
    const [red, green, blue] = hexToRgb(block.hex);
    for (let i = 0; i < block.count; i += 1) {
      data.push(red, green, blue, alpha);
    }
  }
  return Uint8ClampedArray.from(data);
}

/** How far apart two hexes sit on the hue wheel, in degrees. */
function hueGap(a: string, b: string): number {
  const gap = Math.abs(hexToOklch(a).h - hexToOklch(b).h);
  return gap > 180 ? 360 - gap : gap;
}

const HUE_TOLERANCE = 8;

describe("extractPalette", () => {
  it("returns nothing when there are too few usable pixels", () => {
    expect(extractPalette(pixels([{ count: 2, hex: "#0078d2" }]))).toEqual([]);
    expect(extractPalette(new Uint8ClampedArray())).toEqual([]);
  });

  it("finds the colors an image is actually made of", () => {
    const found = extractPalette(
      pixels([
        { count: 400, hex: "#0078d2" },
        { count: 300, hex: "#e60096" },
        { count: 200, hex: "#00d4a8" },
      ])
    );

    expect(found).toHaveLength(3);
    for (const hex of ["#0078d2", "#e60096", "#00d4a8"]) {
      expect(
        found.some((candidate) => hueGap(candidate, hex) < HUE_TOLERANCE)
      ).toBe(true);
    }
  });

  it("ranks a smaller saturated mark above a larger flat grey", () => {
    // Chroma is worth roughly four times its weight in pixels, so a mark a
    // third the size of its grey field still leads the list.
    const [first] = extractPalette(
      pixels([
        { count: 600, hex: "#8a8f98" },
        { count: 200, hex: "#e60096" },
      ])
    );

    expect(hueGap(first, "#e60096")).toBeLessThan(HUE_TOLERANCE);
  });

  it("ignores transparent pixels", () => {
    expect(
      extractPalette(pixels([{ count: 400, hex: "#0078d2" }], TRANSPARENT))
    ).toEqual([]);
  });

  it("ignores near-white and near-black, which carry no usable hue", () => {
    expect(
      extractPalette(
        pixels([
          { count: 500, hex: "#ffffff" },
          { count: 500, hex: "#000000" },
        ])
      )
    ).toEqual([]);
  });

  it("collapses shades of one color into a single candidate", () => {
    const found = extractPalette(
      pixels([
        { count: 300, hex: "#0078d2" },
        { count: 300, hex: "#0179d3" },
        { count: 300, hex: "#0077d1" },
      ])
    );

    expect(found).toHaveLength(1);
    expect(hueGap(found[0], "#0078d2")).toBeLessThan(HUE_TOLERANCE);
  });

  it("never offers more candidates than the picker has room for", () => {
    const found = extractPalette(
      pixels(
        [
          "#d21500",
          "#d27a00",
          "#a8d200",
          "#00d24a",
          "#00c8d2",
          "#0044d2",
          "#7a00d2",
          "#d200a1",
        ].map((hex, index) => ({ count: 200 + index, hex }))
      )
    );

    expect(found.length).toBeLessThanOrEqual(MAX_EXTRACTED);
    expect(found.length).toBeGreaterThan(1);
  });

  it("is deterministic — the same image always proposes the same palette", () => {
    const buffer = pixels([
      { count: 300, hex: "#0078d2" },
      { count: 220, hex: "#ff8900" },
    ]);

    expect(extractPalette(buffer)).toEqual(extractPalette(buffer));
  });
});
