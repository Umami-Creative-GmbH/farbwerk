/**
 * Recharts, fetched the first time a chart renders.
 *
 * Recharts is the single heaviest dependency in the app, and only two of the
 * four gallery sub-views ever draw a chart — the default view draws none. So
 * nothing imports it statically: this module resolves it through `import()`,
 * which puts it in its own chunk that the browser only downloads once a chart
 * is actually on screen.
 *
 * Callers destructure the primitives they need and render them directly:
 *
 *     const { Bar, BarChart, Tooltip: ChartTooltip } = useRecharts();
 *
 * That keeps the real recharts components in the element tree. Wrapping them
 * in local components would break recharts' own child inspection — `Bar`,
 * `Pie`, `Scatter` and `RadialBar` all look for `Cell` children by component
 * identity, and a wrapper hides it.
 *
 * `use()` suspends the calling component until the chunk lands, so every chart
 * needs a `<Suspense>` boundary above it. Once resolved, React reads the
 * settled promise synchronously and later renders never suspend again.
 */
import { use } from "react";
import type * as Recharts from "recharts";

let modulePromise: Promise<typeof Recharts> | undefined;

function loadRecharts(): Promise<typeof Recharts> {
  modulePromise ??= import("recharts");
  return modulePromise;
}

export function useRecharts(): typeof Recharts {
  return use(loadRecharts());
}
