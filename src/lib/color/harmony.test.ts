import { describe, expect, it } from "vitest";
import { hexToOklch } from "./convert";
import {
  HARMONY_OFFSETS,
  HARMONY_RULES,
  harmonizeBase,
  harmonyPreview,
  newRoleBase,
  resolveRoleBase,
} from "./harmony";

const PRIMARY = "#0078d2";
const PRIMARY_HUE = hexToOklch(PRIMARY).h;

// Rotating primary's hue can land outside sRGB. Gamut mapping then pulls the
// color back in, which costs a few degrees of hue — unavoidable on an sRGB
// display, and the chroma-reduction default keeps it under 4°.
const HUE_TOLERANCE = 4;
const LIGHTNESS_TOLERANCE = 0.01;

describe("harmonizeBase", () => {
  it("rotates the hue by the rule's offset and keeps lightness", () => {
    for (const rule of HARMONY_RULES) {
      if (rule === "mono") {
        continue;
      }
      for (const role of ["secondary", "tertiary"] as const) {
        const derived = hexToOklch(harmonizeBase(PRIMARY, role, rule));
        const expected =
          (((PRIMARY_HUE + HARMONY_OFFSETS[rule][role]) % 360) + 360) % 360;
        expect(Math.abs(derived.h - expected)).toBeLessThan(HUE_TOLERANCE);
        expect(Math.abs(derived.l - hexToOklch(PRIMARY).l)).toBeLessThan(
          LIGHTNESS_TOLERANCE
        );
      }
    }
  });

  it("hits the target hue exactly when the rotation stays in gamut", () => {
    const derived = hexToOklch(
      harmonizeBase(PRIMARY, "secondary", "analogous")
    );
    expect(derived.h).toBeCloseTo((PRIMARY_HUE + 30) % 360, 0);
  });

  it("desaturates instead of rotating for mono", () => {
    const base = hexToOklch(PRIMARY);
    const secondary = hexToOklch(harmonizeBase(PRIMARY, "secondary", "mono"));
    const tertiary = hexToOklch(harmonizeBase(PRIMARY, "tertiary", "mono"));
    expect(Math.abs(secondary.h - base.h)).toBeLessThan(HUE_TOLERANCE);
    expect(secondary.c).toBeCloseTo(base.c * 0.55, 2);
    expect(tertiary.c).toBeCloseTo(base.c * 0.28, 2);
  });
});

describe("resolveRoleBase", () => {
  it("derives linked roles at read time from the current primary", () => {
    const stale = "#123456";
    const derived = resolveRoleBase({
      base: stale,
      harmony: "triadic",
      primaryBase: PRIMARY,
      role: "secondary",
    });
    expect(derived).not.toBe(stale);
    expect(derived).toBe(harmonizeBase(PRIMARY, "secondary", "triadic"));
  });

  it("leaves primary and manual roles alone", () => {
    expect(
      resolveRoleBase({
        base: "#ABCDEF",
        harmony: "triadic",
        primaryBase: PRIMARY,
        role: "primary",
      })
    ).toBe("#abcdef");
    expect(
      resolveRoleBase({
        base: "#abcdef",
        harmony: "manual",
        primaryBase: PRIMARY,
        role: "tertiary",
      })
    ).toBe("#abcdef");
  });
});

describe("role helpers", () => {
  it("offsets a newly added role from primary", () => {
    expect(newRoleBase(PRIMARY, "secondary")).not.toBe(PRIMARY);
    expect(newRoleBase(PRIMARY, "tertiary")).not.toBe(
      newRoleBase(PRIMARY, "secondary")
    );
  });

  it("previews three distinct swatches per rule", () => {
    const preview = harmonyPreview(PRIMARY, "triadic");
    expect(preview.primary).toBe(PRIMARY);
    expect(new Set(Object.values(preview)).size).toBe(3);
  });
});
