/**
 * Saved palettes, shared between the toolbar's Save button and the sidebar's
 * list.
 *
 * They sit in different corners of the screen but must agree, so the list lives
 * in one module-level cache both subscribe to rather than in either component's
 * state.
 */
import { useCallback, useEffect, useSyncExternalStore } from "react";

import type { PaletteState } from "@/lib/palette/state";
import {
  deletePalette,
  loadPalettes,
  renamePalette,
  savePalette,
} from "@/lib/palette/storage";
import type { SavedPalette } from "@/lib/palette/storage";

const EMPTY: SavedPalette[] = [];

let cache: SavedPalette[] = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function publish(next: SavedPalette[]): void {
  cache = next;
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): SavedPalette[] {
  return cache;
}

/** The server has no localStorage, so it always renders the empty list. */
function getServerSnapshot(): SavedPalette[] {
  return EMPTY;
}

export interface SavedPalettesApi {
  palettes: SavedPalette[];
  remove: (id: string) => void;
  rename: (id: string, name: string) => void;
  save: (state: PaletteState, name: string) => void;
}

export function useSavedPalettes(): SavedPalettesApi {
  const palettes = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  useEffect(() => {
    if (!hydrated) {
      hydrated = true;
      publish(loadPalettes());
    }
  }, []);

  const save = useCallback((state: PaletteState, name: string) => {
    publish(savePalette(state, name, Date.now()));
  }, []);

  const rename = useCallback((id: string, name: string) => {
    publish(renamePalette(id, name));
  }, []);

  const remove = useCallback((id: string) => {
    publish(deletePalette(id));
  }, []);

  return { palettes, remove, rename, save };
}
