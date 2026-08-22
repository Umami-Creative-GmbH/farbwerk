/**
 * Saved palettes, persisted in localStorage.
 *
 * Closes SPEC gap 1: in the prototype saved palettes lived in component state
 * only, so they vanished on reload and could not be renamed or deleted.
 *
 * What is stored is the *state*, not the rendered ramps — reopening a palette
 * restores every control (sliders, anchor, harmony, overrides), and a change to
 * the generator improves saved palettes rather than leaving them stale.
 */
import type { PaletteState } from "./state";

const STORAGE_KEY = "farbwerk-palettes:v1";
/**
 * The key used before the store was versioned. Read once so saved work survives
 * the upgrade, then retired.
 */
const LEGACY_STORAGE_KEY = "farbwerk-palettes";
const ID_RADIX = 36;
const ID_LENGTH = 9;

export interface SavedPalette {
  id: string;
  name: string;
  /** Epoch milliseconds, so the list can be shown newest first. */
  savedAt: number;
  state: PaletteState;
}

function parseStore(raw: string | null): SavedPalette[] {
  if (!raw) {
    return [];
  }
  const parsed: unknown = JSON.parse(raw);
  return Array.isArray(parsed) ? (parsed as SavedPalette[]) : [];
}

function readStore(): SavedPalette[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return parseStore(raw);
    }
    // v1 stores the same shape the unversioned key did, so entries written
    // before versioning move across untouched. A later shape change bumps the
    // suffix instead, and those entries are then skipped rather than parsed
    // into a shape the app no longer understands.
    const legacy = parseStore(localStorage.getItem(LEGACY_STORAGE_KEY));
    if (legacy.length > 0) {
      writeStore(legacy);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
    return legacy;
  } catch {
    // A corrupt or unavailable store should never take the app down with it.
    return [];
  }
}

function writeStore(palettes: readonly SavedPalette[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(palettes));
  } catch {
    // Private browsing and full quotas both land here; saving is best effort.
  }
}

export function loadPalettes(): SavedPalette[] {
  return readStore().sort((a, b) => b.savedAt - a.savedAt);
}

function newId(): string {
  return Math.random().toString(ID_RADIX).slice(2, ID_LENGTH);
}

/** Save a snapshot of the current palette and return the new list. */
export function savePalette(
  state: PaletteState,
  name: string,
  now: number
): SavedPalette[] {
  const entry: SavedPalette = {
    id: newId(),
    name: name.trim() || "Untitled",
    savedAt: now,
    state,
  };
  const next = [entry, ...readStore()];
  writeStore(next);
  return next.sort((a, b) => b.savedAt - a.savedAt);
}

export function renamePalette(id: string, name: string): SavedPalette[] {
  const next = readStore().map((entry) =>
    entry.id === id ? { ...entry, name: name.trim() || entry.name } : entry
  );
  writeStore(next);
  return next.sort((a, b) => b.savedAt - a.savedAt);
}

export function deletePalette(id: string): SavedPalette[] {
  const next = readStore().filter((entry) => entry.id !== id);
  writeStore(next);
  return next.sort((a, b) => b.savedAt - a.savedAt);
}
