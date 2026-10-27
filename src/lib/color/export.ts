/**
 * Palette export.
 *
 * Seven formats × four notations. Every format emits all present roles, each
 * named from its color name slugified, so a palette with three scales exports
 * three ramps in one go.
 */
import { formatColor } from "./convert";
import { slugifyColorName } from "./name";
import { SCALE_KEYS } from "./types";
import type { ColorNotation, ColorScale } from "./types";

export const EXPORT_FORMATS = [
  { label: "Tailwind 4", value: "tw4" },
  { label: "Tailwind 3", value: "tw3" },
  { label: "CSS", value: "css" },
  { label: "SCSS", value: "scss" },
  { label: "SVG", value: "svg" },
  { label: "Tokens Studio", value: "tokens-studio" },
  { label: "W3C Tokens", value: "w3c" },
] as const;

export type ExportFormat = (typeof EXPORT_FORMATS)[number]["value"];

export const EXPORT_NOTATIONS = [
  { label: "Hex code", value: "hex" },
  { label: "OKLCH", value: "oklch" },
  { label: "HSL", value: "hsl" },
  { label: "RGB", value: "rgb" },
] as const;

export interface ExportRole {
  /** The role's color name — slugified into the emitted token names. */
  name: string;
  scale: ColorScale;
}

/** SVG swatch geometry. */
const SWATCH_WIDTH = 64;
const SWATCH_HEIGHT = 120;

type Emitter = (roles: readonly NamedRole[]) => string;
interface NamedRole {
  /** The role's human-readable name, used to head its block with a comment. */
  name: string;
  scale: ColorScale;
  slug: string;
  value: (key: number) => string;
}

/**
 * One ramp is eleven near-identical lines, so two or three of them run together
 * into a wall. Every format that has comments heads each ramp with its colour
 * name; the blank line between ramps is what actually makes the seam visible.
 *
 * `BLOCK_SEPARATOR` is used even by the JSON formats, which cannot carry a
 * comment — a blank line between entries is still valid JSON.
 */
const BLOCK_SEPARATOR = "\n\n";

/** Runs of whitespace, including the newlines that would end a `//` comment. */
const WHITESPACE_RUN = /\s+/g;
/** The sequence that closes a CSS block comment. */
const CSS_COMMENT_CLOSE = /\*\//g;

/**
 * Names are typed by hand, so they can contain anything. Flattening whitespace
 * keeps a pasted multi-line name from ending a `//` comment on its first line,
 * and dropping the CSS block-comment terminator keeps it from closing one
 * early.
 */
function commentSafe(name: string): string {
  return name
    .replaceAll(WHITESPACE_RUN, " ")
    .replaceAll(CSS_COMMENT_CLOSE, "")
    .trim();
}

function tailwind4(roles: readonly NamedRole[]): string {
  const body = roles
    .map((role) => {
      const steps = SCALE_KEYS.map(
        (key) => `  --color-${role.slug}-${key}: ${role.value(key)};`
      ).join("\n");
      return `  /* ${role.name} */\n${steps}`;
    })
    .join(BLOCK_SEPARATOR);
  return `@import "tailwindcss";\n\n@theme {\n${body}\n}`;
}

function tailwind3(roles: readonly NamedRole[]): string {
  const body = roles
    .map((role) => {
      const steps = SCALE_KEYS.map(
        (key) => `          ${key}: '${role.value(key)}',`
      ).join("\n");
      // The slug is quoted because it is not always a valid identifier: a
      // two-word name slugifies to `hot-pink`, and an unquoted `hot-pink:` key
      // is a syntax error in the config this emits.
      return `        // ${role.name}\n        '${role.slug}': {\n${steps}\n        },`;
    })
    .join(BLOCK_SEPARATOR);
  return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n${body}\n      },\n    },\n  },\n};`;
}

function cssVars(roles: readonly NamedRole[]): string {
  const body = roles
    .map((role) => {
      const steps = SCALE_KEYS.map(
        (key) => `  --${role.slug}-${key}: ${role.value(key)};`
      ).join("\n");
      return `  /* ${role.name} */\n${steps}`;
    })
    .join(BLOCK_SEPARATOR);
  return `:root {\n${body}\n}`;
}

function scssVars(roles: readonly NamedRole[]): string {
  return roles
    .map((role) => {
      const steps = SCALE_KEYS.map(
        (key) => `$${role.slug}-${key}: ${role.value(key)};`
      ).join("\n");
      return `// ${role.name}\n${steps}`;
    })
    .join(BLOCK_SEPARATOR);
}

/** SVG shows the first role only — it is a picture of one ramp. */
function svgSwatches(roles: readonly NamedRole[]): string {
  const [role] = roles;
  const width = SCALE_KEYS.length * SWATCH_WIDTH;
  const rects = SCALE_KEYS.map(
    (key, index) =>
      `  <rect x="${index * SWATCH_WIDTH}" y="0" width="${SWATCH_WIDTH}" height="${SWATCH_HEIGHT}" fill="${role.scale[key]}"><title>${role.slug}-${key}</title></rect>`
  ).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${SWATCH_HEIGHT}" viewBox="0 0 ${width} ${SWATCH_HEIGHT}">\n${rects}\n</svg>`;
}

function tokensStudio(roles: readonly NamedRole[]): string {
  const body = roles
    .map((role) => {
      const steps = SCALE_KEYS.map(
        (key) =>
          `    "${key}": {\n      "value": "${role.value(key)}",\n      "type": "color"\n    }`
      ).join(",\n");
      return `  "${role.slug}": {\n${steps}\n  }`;
    })
    // No comment: JSON has none. The blank line is the only separation
    // available that keeps the output parseable.
    .join(`,${BLOCK_SEPARATOR}`);
  return `{\n${body}\n}`;
}

function w3cTokens(roles: readonly NamedRole[]): string {
  const body = roles
    .map((role) => {
      const steps = SCALE_KEYS.map(
        (key) => `    "${key}": { "$value": "${role.value(key)}" }`
      ).join(",\n");
      return `  "${role.slug}": {\n    "$type": "color",\n${steps}\n  }`;
    })
    .join(`,${BLOCK_SEPARATOR}`);
  return `{\n${body}\n}`;
}

const EMITTERS: Record<ExportFormat, Emitter> = {
  css: cssVars,
  scss: scssVars,
  svg: svgSwatches,
  "tokens-studio": tokensStudio,
  tw3: tailwind3,
  tw4: tailwind4,
  w3c: w3cTokens,
};

/** File extension and MIME type, for download-as-file. */
export const EXPORT_FILE_META: Record<
  ExportFormat,
  { extension: string; mimeType: string }
> = {
  css: { extension: "css", mimeType: "text/css" },
  scss: { extension: "scss", mimeType: "text/x-scss" },
  svg: { extension: "svg", mimeType: "image/svg+xml" },
  "tokens-studio": { extension: "json", mimeType: "application/json" },
  tw3: { extension: "js", mimeType: "text/javascript" },
  tw4: { extension: "css", mimeType: "text/css" },
  w3c: { extension: "json", mimeType: "application/json" },
};

/** Render a palette in one format and notation. */
export function exportPalette(
  roles: readonly ExportRole[],
  format: ExportFormat = "tw4",
  notation: ColorNotation = "hex"
): string {
  if (roles.length === 0) {
    throw new Error("Nothing to export: the palette has no scales");
  }

  const named: NamedRole[] = roles.map((role, index) => {
    const slug = slugifyColorName(role.name) || `scale-${index + 1}`;

    return {
      // The comment shows the name as typed — "Hot Pink!", not "hot-pink".
      // An unnamed role has nothing to show, so it falls back to its slug.
      name: commentSafe(role.name) || slug,
      scale: role.scale,
      slug,
      value: (key: number) => formatColor(role.scale[key as never], notation),
    };
  });

  return EMITTERS[format](named);
}
