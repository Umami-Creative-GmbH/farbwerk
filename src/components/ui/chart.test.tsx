// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import type * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegendContent,
  ChartTooltipContent,
} from "./chart";

// ResponsiveContainer measures its parent, which is always 0x0 under jsdom, so
// it would render nothing at all. These tests only need the chart context.
vi.mock("@/components/ui/recharts", () => {
  // Declared in the factory, which runs once, so the component type stays
  // stable across renders. A fresh type each render would remount the subtree
  // and destroy the very node identity these tests check.
  const Passthrough = ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  );
  return { useRecharts: () => ({ ResponsiveContainer: Passthrough }) };
});

const CONFIG: ChartConfig = {
  signups: { color: "#0078d2", label: "Signups" },
  visits: { color: "#e60096", label: "Visits" },
};

type TooltipPayload = NonNullable<
  React.ComponentProps<typeof ChartTooltipContent>["payload"]
>;
type LegendPayload = NonNullable<
  React.ComponentProps<typeof ChartLegendContent>["payload"]
>;

const SIGNUPS = {
  color: "#0078d2",
  dataKey: "signups",
  graphicalItemId: "signups",
  name: "signups",
};
const VISITS = {
  color: "#e60096",
  dataKey: "visits",
  graphicalItemId: "visits",
  name: "visits",
};
/** Recharts marks series it is hiding rather than removing them. */
const HIDDEN = {
  color: "#888",
  dataKey: "gap",
  graphicalItemId: "gap",
  name: "gap",
  type: "none" as const,
};

/** Captured rather than printed, so a duplicate-key warning can be asserted on. */
let consoleErrors: string[] = [];

beforeEach(() => {
  consoleErrors = [];
  vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
    consoleErrors.push(String(args[0]));
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function keyWarnings(): string[] {
  return consoleErrors.filter((message) => message.includes("key"));
}

/**
 * The innermost element whose text is exactly this series label, as a DOM node
 * identity to compare across renders. The tooltip wraps its label in a span,
 * the legend leaves it as a bare child of the row.
 */
function labelNode(container: HTMLElement, label: string): Element {
  const matches = [...container.querySelectorAll("*")].filter(
    (element) => element.textContent === label
  );
  // Document order lists ancestors first, so the last match is the deepest.
  const found = matches.at(-1);
  if (!found) {
    throw new Error(`No label ${label} in ${container.innerHTML}`);
  }
  return found;
}

describe("chart tooltip keys", () => {
  it("drops hidden series and keeps a row per visible one", () => {
    const { container } = render(
      <ChartContainer config={CONFIG}>
        <ChartTooltipContent
          active
          payload={[
            { ...SIGNUPS, value: 12 },
            { ...HIDDEN, value: 0 },
            { ...VISITS, value: 34 },
          ]}
        />
      </ChartContainer>
    );

    expect(labelNode(container, "Signups")).toBeDefined();
    expect(labelNode(container, "Visits")).toBeDefined();
    expect(container.textContent).not.toContain("gap");
    expect(keyWarnings()).toEqual([]);
  });

  it("keeps a series on its own DOM node when the payload reorders", () => {
    const view = (items: TooltipPayload) => (
      <ChartContainer config={CONFIG}>
        <ChartTooltipContent active payload={items} />
      </ChartContainer>
    );
    const { container, rerender } = render(
      view([
        { ...SIGNUPS, value: 12 },
        { ...VISITS, value: 34 },
      ])
    );
    const signupsBefore = labelNode(container, "Signups");

    // Recharts reorders payload by value when the data changes. Keyed by the
    // series, React moves the row; keyed by index it would rewrite whichever
    // row happens to sit in that slot.
    rerender(
      view([
        { ...VISITS, value: 99 },
        { ...SIGNUPS, value: 12 },
      ])
    );

    expect(labelNode(container, "Signups")).toBe(signupsBefore);
    expect(keyWarnings()).toEqual([]);
  });
});

describe("chart legend keys", () => {
  it("keeps a series on its own DOM node when the payload reorders", () => {
    const view = (items: LegendPayload) => (
      <ChartContainer config={CONFIG}>
        <ChartLegendContent payload={items} />
      </ChartContainer>
    );
    const { container, rerender } = render(
      view([
        { ...SIGNUPS, value: "signups" },
        { ...VISITS, value: "visits" },
      ])
    );
    const signupsBefore = labelNode(container, "Signups");

    rerender(
      view([
        { ...VISITS, value: "visits" },
        { ...SIGNUPS, value: "signups" },
      ])
    );

    expect(labelNode(container, "Signups")).toBe(signupsBefore);
    expect(keyWarnings()).toEqual([]);
  });
});
