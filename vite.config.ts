import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const config = defineConfig({
  // Lets the app read the same TOLGEE_* vars from .env.local that
  // tolgee.config.cjs uses, instead of keeping a duplicate VITE_ set.
  // Only referenced vars are inlined, and src/i18n/tolgee.ts references them
  // solely inside an `import.meta.env.DEV` branch, so the key never reaches a
  // production bundle.
  envPrefix: ["VITE_", "TOLGEE_"],
  plugins: [
    devtools(),
    tailwindcss(),
    // Generate routeTree.gen.ts in the project's Prettier style, so
    // regenerating it does not fail `bun run check`.
    tanstackStart({ router: { quoteStyle: "double" } }),
    // React Compiler, via plugin-react's own option rather than a babel
    // plugin — v6 runs the oxc transform and ignores a `babel` key entirely.
    // React 19 ships the compiler runtime, so nothing else is needed.
    viteReact({ compiler: true }),
  ],
  resolve: { tsconfigPaths: true },
});

export default config;
