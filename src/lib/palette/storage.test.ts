import { beforeEach, describe, expect, it, vi } from "vitest";

import { initialPaletteState } from "./state";
import { loadPalettes, savePalette } from "./storage";
import type { SavedPalette } from "./storage";

const STORAGE_KEY = "farbwerk-palettes:v1";
const LEGACY_STORAGE_KEY = "farbwerk-palettes";

const SAVED_AT = 1_700_000_000_000;

/** jsdom does not supply a working Storage here, so the tests bring their own. */
function memoryStorage() {
  const entries = new Map<string, string>();
  return {
    clear: () => entries.clear(),
    getItem: (key: string) => entries.get(key) ?? null,
    key: (index: number) => [...entries.keys()][index] ?? null,
    get length() {
      return entries.size;
    },
    removeItem: (key: string) => entries.delete(key),
    setItem: (key: string, value: string) => entries.set(key, value),
  };
}

function legacyEntry(name: string, savedAt: number): SavedPalette {
  return { id: `legacy-${name}`, name, savedAt, state: initialPaletteState() };
}

beforeEach(() => {
  vi.stubGlobal("localStorage", memoryStorage());
});

describe("versioned store", () => {
  it("writes under the versioned key, not the bare one", () => {
    savePalette(initialPaletteState(), "Azure", SAVED_AT);

    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
    expect(localStorage.getItem(LEGACY_STORAGE_KEY)).toBeNull();
  });

  it("adopts palettes saved before the store was versioned", () => {
    localStorage.setItem(
      LEGACY_STORAGE_KEY,
      JSON.stringify([legacyEntry("Older", SAVED_AT)])
    );

    expect(loadPalettes().map((entry) => entry.name)).toEqual(["Older"]);
    // Migrated once, then the old key is retired so it cannot resurface.
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
    expect(localStorage.getItem(LEGACY_STORAGE_KEY)).toBeNull();
  });

  it("ignores a stale unversioned key once the versioned one exists", () => {
    savePalette(initialPaletteState(), "Current", SAVED_AT);
    localStorage.setItem(
      LEGACY_STORAGE_KEY,
      JSON.stringify([legacyEntry("Stale", SAVED_AT + 1)])
    );

    expect(loadPalettes().map((entry) => entry.name)).toEqual(["Current"]);
  });

  it("survives a corrupt store instead of taking the app down", () => {
    localStorage.setItem(STORAGE_KEY, "{not json");

    expect(loadPalettes()).toEqual([]);
  });
});
