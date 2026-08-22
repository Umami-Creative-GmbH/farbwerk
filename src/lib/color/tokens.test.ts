import { describe, expect, it } from "vitest";
import { wcagContrast } from "./contrast";
import { buildScale } from "./scale";
import { galleryVars, paletteVars, themeVars } from "./tokens";
import { SCALE_KEYS } from "./types";

const VAR_REFERENCE = /^var\((--[a-z]-\d+)\)$/;

const primary = buildScale({ base: "#0078d2" });
const secondary = buildScale({ base: "#e60096" });

describe("paletteVars", () => {
  it("emits every step of every role", () => {
    const vars = paletteVars({ primary, secondary });
    for (const key of SCALE_KEYS) {
      expect(vars[`--p-${key}`]).toBe(primary[key]);
      expect(vars[`--s-${key}`]).toBe(secondary[key]);
    }
  });

  it("falls back to the previous role when one is missing", () => {
    const vars = paletteVars({ primary });
    expect(vars["--s-500"]).toBe(primary[500]);
    expect(vars["--t-500"]).toBe(primary[500]);
  });
});

describe("themeVars", () => {
  it("points shadcn tokens at the palette rather than hardcoding hex", () => {
    const vars = themeVars({ primary, secondary });
    expect(vars["--primary"]).toBe("var(--p-600)");
    expect(vars["--chart-2"]).toBe("var(--s-500)");
  });

  it("gives all three ramps a role, not just primary", () => {
    const vars = themeVars({ primary, secondary });
    // secondary owns the quiet surfaces, tertiary owns the accent ones.
    expect(vars["--secondary"]).toBe("var(--s-100)");
    expect(vars["--sidebar-accent"]).toBe("var(--s-200)");
    expect(vars["--accent"]).toBe("var(--t-100)");
    expect(vars["--accent-foreground"]).toBe("var(--t-900)");
    const charts = [1, 2, 3, 4, 5].map((n) => vars[`--chart-${n}`]);
    expect(charts.some((v) => v.includes("--p-"))).toBe(true);
    expect(charts.some((v) => v.includes("--s-"))).toBe(true);
    expect(charts.some((v) => v.includes("--t-"))).toBe(true);
  });

  it("picks readable ink for the primary surface", () => {
    const vars = themeVars({ primary, secondary });
    expect(
      wcagContrast(vars["--primary-foreground"], primary[600])
    ).toBeGreaterThan(3);
  });

  it("flips card text to the other end of the ramp in dark", () => {
    const light = themeVars({ primary }, "light");
    const dark = themeVars({ primary }, "dark");
    expect(light["--fw-card-title"]).toBe("var(--p-950)");
    expect(dark["--fw-card-title"]).toBe("var(--p-50)");
    expect(light["--fw-accent-ink"]).toBe("var(--t-600)");
    expect(dark["--fw-accent-ink"]).toBe("var(--t-400)");
  });

  it("moves surfaces and accents when the mode flips", () => {
    const light = themeVars({ primary }, "light");
    const dark = themeVars({ primary }, "dark");
    expect(light["--background"]).toBe("var(--p-50)");
    expect(dark["--background"]).toBe("var(--p-950)");
    expect(dark["--primary"]).toBe("var(--p-400)");
  });
});

describe("galleryVars", () => {
  it("merges both layers so the wrapper can resolve every var()", () => {
    const vars = galleryVars({ primary, secondary });
    expect(vars["--p-500"]).toBe(primary[500]);
    expect(vars["--card"]).toBeTruthy();
    for (const value of Object.values(vars)) {
      const reference = VAR_REFERENCE.exec(value);
      if (reference) {
        expect(vars[reference[1]]).toBeTruthy();
      }
    }
  });
});
