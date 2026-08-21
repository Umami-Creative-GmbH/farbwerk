import { colornames } from "color-name-list";
import { describe, expect, it } from "vitest";
import { createColorNamer, slugifyColorName } from "./name";
import { buildScale } from "./scale";
import { SCALE_KEYS } from "./types";

const HEX = /^#[0-9a-f]{6}$/;
const INVALID_HEX = /Not a valid hex/;

// Exercised against the same full catalogue the server function loads.
const namer = createColorNamer(colornames);
const nearestColorName = namer.name;

describe("createColorNamer", () => {
  it("finds an exact catalogue match at distance 0", () => {
    const match = nearestColorName("#ff0000");
    expect(match.name).toBe("Red");
    expect(match.hex).toBe("#ff0000");
    expect(match.distance).toBe(0);
  });

  it("finds a near match for an arbitrary color", () => {
    const match = nearestColorName("#0078d2");
    expect(match.name).toBeTruthy();
    expect(match.distance).toBeGreaterThan(0);
    expect(match.hex).toMatch(HEX);
  });

  it("accepts any hex spelling and is stable across calls", () => {
    expect(nearestColorName("#08D")).toEqual(nearestColorName("#0088dd"));
  });

  it("names a whole palette in one batch", () => {
    const scale = buildScale({ base: "#0078d2" });
    const names = namer.nameAll(SCALE_KEYS.map((key) => scale[key]));
    expect(names).toHaveLength(SCALE_KEYS.length);
    expect(names[0].input).toBe(scale[50]);
  });

  it("names every step of a generated scale", () => {
    const scale = buildScale({ base: "#0078d2" });
    for (const key of SCALE_KEYS) {
      expect(nearestColorName(scale[key]).name).toBeTruthy();
    }
  });

  it("rejects input that is not a hex color", () => {
    expect(() => nearestColorName("papayawhip")).toThrow(INVALID_HEX);
  });
});

describe("slugifyColorName", () => {
  it("produces export-safe scale names", () => {
    expect(slugifyColorName("Azure Radiance")).toBe("azure-radiance");
    expect(slugifyColorName("100 Mph")).toBe("100-mph");
    expect(slugifyColorName("Star of Life!")).toBe("star-of-life");
  });
});
