import { describe, expect, it } from "vitest";
import { EXPORT_FORMATS, type ExportRole, exportPalette } from "./export";
import { buildScale } from "./scale";
import { SCALE_KEYS } from "./types";

const ROLES: ExportRole[] = [
  { name: "Azure", scale: buildScale({ base: "#0078d2" }) },
  { name: "Hot Pink!", scale: buildScale({ base: "#e60096" }) },
];

const SINGLE = ROLES.slice(0, 1);
const EMPTY_PALETTE = /no scales/;
const TRAILING_BLANK_LINE = /\n\n\s*$/;
const CSS_COMMENT_CLOSE = /\*\//g;

describe("exportPalette", () => {
  it("defaults to a Tailwind 4 theme block in hex", () => {
    const out = exportPalette(SINGLE);
    expect(out).toContain('@import "tailwindcss";');
    expect(out).toContain("@theme {");
    expect(out).toContain(`--color-azure-500: ${SINGLE[0].scale[500]};`);
  });

  it("slugifies role names into token names", () => {
    expect(exportPalette(ROLES, "css")).toContain("--hot-pink-950:");
  });

  it("emits every present role in every text format", () => {
    for (const { value } of EXPORT_FORMATS) {
      if (value === "svg") {
        continue;
      }
      const out = exportPalette(ROLES, value);
      expect(out, value).toContain("azure");
      expect(out, value).toContain("hot-pink");
    }
  });

  it("emits all eleven steps", () => {
    const out = exportPalette(SINGLE, "scss");
    for (const key of SCALE_KEYS) {
      expect(out).toContain(`$azure-${key}:`);
    }
  });

  it("switches notation", () => {
    expect(exportPalette(SINGLE, "css", "rgb")).toContain("rgb(");
    expect(exportPalette(SINGLE, "css", "oklch")).toContain("oklch(");
    expect(exportPalette(SINGLE, "css", "hsl")).toContain("hsl(");
  });

  it("produces parseable JSON for the token formats", () => {
    const studio = JSON.parse(exportPalette(ROLES, "tokens-studio"));
    expect(studio.azure["500"].type).toBe("color");
    const w3c = JSON.parse(exportPalette(ROLES, "w3c"));
    expect(w3c["hot-pink"].$type).toBe("color");
    expect(w3c["hot-pink"]["500"].$value).toBe(ROLES[1].scale[500]);
  });

  it("draws one labelled rect per step in the SVG", () => {
    const svg = exportPalette(SINGLE, "svg");
    expect(svg.match(/<rect /g)).toHaveLength(SCALE_KEYS.length);
    expect(svg).toContain("<title>azure-950</title>");
    expect(svg).toContain(`width="${SCALE_KEYS.length * 64}"`);
  });

  it("refuses to export an empty palette", () => {
    expect(() => exportPalette([])).toThrow(EMPTY_PALETTE);
  });

  it("heads each ramp with its name in the commentable formats", () => {
    expect(exportPalette(ROLES, "tw4")).toContain("/* Azure */");
    expect(exportPalette(ROLES, "css")).toContain("/* Hot Pink! */");
    expect(exportPalette(ROLES, "scss")).toContain("// Azure");
    expect(exportPalette(ROLES, "tw3")).toContain("// Hot Pink!");
  });

  it("separates ramps with a blank line in every text format", () => {
    for (const { value } of EXPORT_FORMATS) {
      if (value === "svg") {
        continue;
      }
      expect(exportPalette(ROLES, value), value).toContain("\n\n");
    }
  });

  it("keeps a one-ramp export free of trailing blank lines", () => {
    for (const { value } of EXPORT_FORMATS) {
      expect(exportPalette(SINGLE, value), value).not.toMatch(
        TRAILING_BLANK_LINE
      );
    }
  });

  it("quotes the Tailwind 3 colour key so a two-word name stays valid JS", () => {
    const out = exportPalette(ROLES, "tw3");
    expect(out).toContain("'hot-pink': {");
    // An unquoted `hot-pink:` key is a syntax error, so the emitted config
    // has to be evaluable to be worth anything.
    const evaluate = new Function(
      `const module = { exports: {} }; ${out}; return module.exports;`
    );
    expect(evaluate().theme.extend.colors["hot-pink"][500]).toBe(
      ROLES[1].scale[500]
    );
  });

  it("neutralises a name that would break out of its comment", () => {
    const hostile: ExportRole[] = [
      { name: "*/ oops", scale: ROLES[0].scale },
      { name: "two\nlines", scale: ROLES[1].scale },
    ];
    const css = exportPalette(hostile, "css");
    // One `*/` per comment opened, and no stray newline inside one.
    expect(css.match(CSS_COMMENT_CLOSE)).toHaveLength(2);
    expect(css).toContain("/* two lines */");
  });

  it("still produces parseable JSON once ramps are spaced apart", () => {
    expect(() =>
      JSON.parse(exportPalette(ROLES, "tokens-studio"))
    ).not.toThrow();
    expect(() => JSON.parse(exportPalette(ROLES, "w3c"))).not.toThrow();
  });
});
