/**
 * The live component gallery.
 *
 * The wrapper carries the whole palette as CSS custom properties: the raw ramps
 * (`--p-*`, `--s-*`, `--t-*`) plus a remap of shadcn's theme tokens onto them.
 * Everything below inherits from that, which is why the dashboard-01 blocks and
 * the charts repaint on any palette change without being touched.
 */
import { type CSSProperties, useCallback, useMemo, useState } from "react";
import { usePalette } from "@/components/palette/palette-context";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { galleryVars, type ThemeMode } from "@/lib/color/tokens";
import { cn } from "@/lib/utils";
import { BlocksView } from "./blocks-view";
import { ChartsView } from "./charts-view";
import { ComponentsView } from "./components-view";

const SUB_VIEWS = [
  { label: "Components", value: "components" },
  { label: "Blocks", value: "blocks" },
  { label: "Charts", value: "charts" },
] as const;

type SubView = (typeof SUB_VIEWS)[number]["value"];

/**
 * Cards flow into as many 268px columns as fit. Deliberately a grid and not CSS
 * multi-column, which pushes cards into off-canvas columns and clips them.
 */
const CARD_GRID =
  "grid grid-cols-[repeat(auto-fill,minmax(268px,1fr))] items-start gap-5";
/** Blocks are full-bleed by nature, so they stack instead of tiling. */
const BLOCK_STACK = "flex flex-col gap-5";

export interface PaletteGalleryProps {
  className?: string;
  mode?: ThemeMode;
}

export function PaletteGallery({
  mode = "light",
  className,
}: PaletteGalleryProps) {
  const { scales } = usePalette();
  const [view, setView] = useState<SubView>("components");

  const handleViewChange = useCallback((next: string[]) => {
    setView((next[0] as SubView) ?? "components");
  }, []);

  const style = useMemo(
    () => galleryVars(scales, mode) as CSSProperties,
    [scales, mode]
  );

  return (
    <section
      className={cn(
        "flex flex-col gap-5 rounded-xl border border-border bg-background p-5 text-foreground",
        className
      )}
      style={style}
    >
      <ToggleGroup
        aria-label="Gallery view"
        className="self-start"
        multiple={false}
        onValueChange={handleViewChange}
        value={[view]}
        variant="outline"
      >
        {SUB_VIEWS.map((item) => (
          <ToggleGroupItem key={item.value} value={item.value}>
            {item.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <div className={view === "blocks" ? BLOCK_STACK : CARD_GRID}>
        {view === "components" ? <ComponentsView /> : null}
        {view === "blocks" ? <BlocksView /> : null}
        {view === "charts" ? <ChartsView /> : null}
      </div>
    </section>
  );
}
