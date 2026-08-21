/**
 * Resolve hex codes to human color names through `/api/color-name`, so the
 * ~1.3 MB name catalogue stays on the server.
 *
 * Lookups are debounced and cached per hex, so dragging a slider does not fire
 * a request per frame, and a color that has been named once never asks again.
 */
import { useEffect, useState } from "react";
import type { ColorNameMatch } from "@/lib/color/name";

const SETTLE_MS = 200;
const MAX_BATCH = 64;

const cache = new Map<string, string>();

function cachedNames(hexes: readonly string[]): Record<string, string> {
  const known: Record<string, string> = {};
  for (const hex of hexes) {
    const name = cache.get(hex);
    if (name) {
      known[hex] = name;
    }
  }
  return known;
}

async function fetchNames(hexes: readonly string[]): Promise<void> {
  const query = hexes.map((hex) => `hex=${encodeURIComponent(hex)}`).join("&");
  const response = await fetch(`/api/color-name?${query}`);
  if (!response.ok) {
    throw new Error(`Color name lookup failed: ${response.status}`);
  }
  const matches: ColorNameMatch[] = await response.json();
  for (const match of matches) {
    cache.set(match.input, match.name);
  }
}

/**
 * Names for the given hexes. Colors that have not resolved yet are simply
 * absent from the result — render a placeholder for those.
 */
export function useColorNames(
  hexes: readonly string[]
): Record<string, string> {
  const [names, setNames] = useState<Record<string, string>>(() =>
    cachedNames(hexes)
  );
  // The array identity changes every render; the joined key does not.
  const wanted = hexes.join(",");

  useEffect(() => {
    const list = wanted.split(",").filter(Boolean);
    setNames(cachedNames(list));

    const missing = [...new Set(list.filter((hex) => !cache.has(hex)))].slice(
      0,
      MAX_BATCH
    );
    if (missing.length === 0) {
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      fetchNames(missing)
        .then(() => {
          if (!cancelled) {
            setNames(cachedNames(list));
          }
        })
        .catch(() => {
          // Naming is decoration; a failed lookup just leaves the label blank.
        });
    }, SETTLE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [wanted]);

  return names;
}
