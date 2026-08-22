import { describe, expect, it } from "vitest";
import { exportPalette } from "@/lib/color/export";
import {
  exportRoles,
  initialPaletteState,
  type PaletteState,
  paletteReducer,
} from "./state";

function withSecondary(): PaletteState {
  return paletteReducer(initialPaletteState(), {
    role: "secondary",
    type: "addRole",
  });
}

describe("role names", () => {
  it("starts every role unnamed, so the placeholder shows through", () => {
    const state = withSecondary();
    expect(state.roles.primary.name).toBe("");
    expect(state.roles.secondary?.name).toBe("");
  });
});

describe("generate", () => {
  it("creates both linked roles and points them at the rule", () => {
    const generated = paletteReducer(initialPaletteState(), {
      rule: "triadic",
      type: "generate",
    });
    expect(generated.roles.secondary?.harmony).toBe("triadic");
    expect(generated.roles.tertiary?.harmony).toBe("triadic");
  });

  it("relinks roles that already exist without discarding their fields", () => {
    const withRole = paletteReducer(withSecondary(), {
      control: "chroma",
      type: "setControl",
      value: 1.4,
    });
    const generated = paletteReducer(withRole, {
      rule: "complement",
      type: "generate",
    });
    expect(generated.roles.secondary?.harmony).toBe("complement");
    // The slider the user had already moved survives the regeneration.
    expect(generated.roles.secondary?.chroma).toBe(1.4);
  });

  it("leaves primary alone", () => {
    const before = initialPaletteState();
    const after = paletteReducer(before, { rule: "mono", type: "generate" });
    expect(after.roles.primary).toEqual(before.roles.primary);
  });
});

describe("exportRoles", () => {
  it("prefers the resolved name over the role", () => {
    const roles = exportRoles(initialPaletteState(), {
      primary: "Wizard Blue",
    });
    expect(roles[0].name).toBe("Wizard Blue");
  });

  it("falls back to the typed name when nothing is resolved", () => {
    const typed = paletteReducer(initialPaletteState(), {
      name: "Brand",
      type: "setName",
    });
    expect(exportRoles(typed)[0].name).toBe("Brand");
  });

  it("falls back to the role itself when there is no name at all", () => {
    expect(exportRoles(initialPaletteState())[0].name).toBe("primary");
  });

  it("names every present role", () => {
    const roles = exportRoles(withSecondary(), {
      primary: "Wizard Blue",
      secondary: "Orangish Brown",
    });
    expect(roles.map((role) => role.name)).toEqual([
      "Wizard Blue",
      "Orangish Brown",
    ]);
  });
});

describe("exported token names", () => {
  it("slugifies the resolved name to lowercase and dashes", () => {
    const out = exportPalette(
      exportRoles(initialPaletteState(), { primary: "Wizard Blue" }),
      "css"
    );
    expect(out).toContain("--wizard-blue-500:");
  });

  it("strips punctuation from a hand-typed name", () => {
    const out = exportPalette(
      exportRoles(initialPaletteState(), { primary: "My Brand Blue!" }),
      "css"
    );
    expect(out).toContain("--my-brand-blue-500:");
    expect(out).not.toContain("!");
  });
});
