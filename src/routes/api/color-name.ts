/**
 * `GET /api/color-name?hex=#0078d2&hex=#e60096` → nearest catalogue name per hex.
 *
 * The full `color-name-list` catalogue is ~32k entries / ~1.3 MB, which has no
 * business in a client bundle. It is imported dynamically here so it is read
 * once, on the server, the first time someone asks — and the browser only ever
 * exchanges hex codes for names.
 */
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { createColorNamer } from "@/lib/color/name";
import type { ColorNamer } from "@/lib/color/name";

const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const MAX_BATCH = 64;
const BAD_REQUEST = 400;
/** A hex always maps to the same name, so let the browser keep the answer. */
const IMMUTABLE = "public, max-age=31536000, immutable";

const hexList = z.array(z.string().regex(HEX)).min(1).max(MAX_BATCH);

let namer: ColorNamer | null = null;

async function getNamer(): Promise<ColorNamer> {
  if (!namer) {
    const { colornames } = await import("color-name-list");
    namer = createColorNamer(colornames);
  }
  return namer;
}

export const Route = createFileRoute("/api/color-name")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const hexes = new URL(request.url).searchParams.getAll("hex");
        const parsed = hexList.safeParse(hexes);
        if (!parsed.success) {
          return Response.json(
            { error: `Pass 1–${MAX_BATCH} hex colors as ?hex=` },
            { status: BAD_REQUEST }
          );
        }

        const resolved = await getNamer();
        return Response.json(resolved.nameAll(parsed.data), {
          headers: { "cache-control": IMMUTABLE },
        });
      },
    },
  },
});
