/**
 * Production server.
 *
 * `vite build` emits a client bundle in `dist/client` and a server bundle in
 * `dist/server/server.js`. That server bundle only exports a fetch handler —
 * it never opens a socket and never serves the client assets — so a host that
 * runs it directly starts nothing and answers nothing. This file is the piece
 * that binds a port, serves `dist/client`, and hands everything else (SSR and
 * the `/api/*` server routes) to the handler.
 *
 * Run it with `bun run start`, after `bun run build`.
 */

const CLIENT_DIR = "dist/client";
const DEFAULT_PORT = 3000;
const ONE_YEAR_SECONDS = 31_536_000;

interface FetchHandler {
  fetch: (request: Request) => Response | Promise<Response>;
}

// Computed rather than literal so `tsc --noEmit` does not demand a build first:
// `dist/` is gitignored and only exists after `bun run build`.
const serverEntry = "./dist/server/server.js";
const { default: handler } = (await import(serverEntry)) as {
  default: FetchHandler;
};

/**
 * Vite fingerprints everything under `/assets`, so those are safe to cache
 * forever. Anything else in the client dir (favicons, og images, robots.txt)
 * keeps its name across deploys and gets a short cache instead.
 */
const cacheControlFor = (pathname: string) =>
  pathname.startsWith("/assets/")
    ? `public, max-age=${ONE_YEAR_SECONDS}, immutable`
    : "public, max-age=3600";

const staticResponse = async (pathname: string) => {
  // Reject traversal before it reaches the filesystem.
  if (pathname.includes("..")) {
    return null;
  }

  const file = Bun.file(`${CLIENT_DIR}${pathname}`);

  if (!(await file.exists())) {
    return null;
  }

  return new Response(file, {
    headers: { "cache-control": cacheControlFor(pathname) },
  });
};

const port = Number(process.env.PORT ?? DEFAULT_PORT);

const server = Bun.serve({
  fetch: async (request) => {
    const { pathname } = new URL(request.url);
    const asset = await staticResponse(pathname);

    return asset ?? (await handler.fetch(request));
  },
  // 0.0.0.0, not localhost: inside a container the proxy reaches us from
  // outside the network namespace, and a loopback bind is invisible to it.
  hostname: "0.0.0.0",
  port,
});

process.stdout.write(
  `farbwerk listening on http://${server.hostname}:${server.port}\n`
);
