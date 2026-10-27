/**
 * Hex → human color name.
 *
 * Deliberately list-agnostic: the catalogue is passed in, not imported here.
 * `color-name-list` is ~1.3 MB, which has no business in a client bundle, so
 * the full list is only ever loaded on the server (see
 * `src/server/color-names.ts`) and the browser asks for names over an RPC.
 *
 * `nearest-color` does the actual lookup — naive nearest-neighbour in RGB space.
 */
import nearestColor from "nearest-color";
import type { NearestColorMatcher } from "nearest-color";

import { normalizeHex } from "./convert";

export interface ColorNameEntry {
  hex: string;
  name: string;
}

export interface ColorNameMatch {
  /** Euclidean RGB distance to the catalogue color. 0 means exact. */
  distance: number;
  /** The catalogue color the name belongs to — not the queried hex. */
  hex: string;
  /** The hex that was looked up, normalised. */
  input: string;
  /** The catalogue name, e.g. "Azure Radiance". */
  name: string;
  /** Slugified name, ready to use as a scale name in exports. */
  slug: string;
}

const NON_SLUG = /[^a-z0-9-]+/g;
const EDGE_DASHES = /^-+|-+$/g;

/** `Azure Radiance` → `azure-radiance`, matching the export naming rule. */
export function slugifyColorName(name: string): string {
  return name
    .toLowerCase()
    .replaceAll(NON_SLUG, "-")
    .replaceAll(EDGE_DASHES, "");
}

export interface ColorNamer {
  /** Nearest catalogue name for one hex. */
  name: (hex: string) => ColorNameMatch;
  /** Nearest names for a batch — one round trip for a whole palette. */
  nameAll: (hexes: readonly string[]) => ColorNameMatch[];
}

/**
 * Build a namer over a catalogue. Results are memoised, so repainting a scale
 * on every slider tick costs one lookup per genuinely new color.
 */
export function createColorNamer(
  catalogue: readonly ColorNameEntry[]
): ColorNamer {
  const byName: Record<string, string> = {};
  for (const entry of catalogue) {
    byName[entry.name] = entry.hex;
  }
  const match: NearestColorMatcher = nearestColor.from(byName);
  const cache = new Map<string, ColorNameMatch>();

  const name = (hex: string): ColorNameMatch => {
    const input = normalizeHex(hex);
    if (!input) {
      throw new Error(`Not a valid hex color: "${hex}"`);
    }

    const cached = cache.get(input);
    if (cached) {
      return cached;
    }

    const found = match(input);
    if (!found) {
      throw new Error("Color name catalogue is empty");
    }

    const result: ColorNameMatch = {
      distance: found.distance,
      hex: normalizeHex(found.value) ?? found.value,
      input,
      name: found.name,
      slug: slugifyColorName(found.name),
    };
    cache.set(input, result);
    return result;
  };

  return { name, nameAll: (hexes) => hexes.map(name) };
}
