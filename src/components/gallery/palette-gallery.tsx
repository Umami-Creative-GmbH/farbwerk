/**
 * The live component gallery.
 *
 * The wrapper carries the whole palette as CSS custom properties: the raw ramps
 * (`--p-*`, `--s-*`, `--t-*`) plus a remap of shadcn's theme tokens onto them.
 * Everything below inherits from that, which is why the dashboard-01 blocks and
 * the charts repaint on any palette change without being touched.
 *
 * There is deliberately no panel around the grid — the cards sit straight on the
 * page, the way the reference lays them out. A box here would read as a second
 * surface competing with the cards it contains.
 */
import { useTranslate } from "@tolgee/react";
import {
  type CSSProperties,
  Suspense,
  useCallback,
  useMemo,
  useState,
} from "react";
import { usePalette } from "@/components/palette/palette-context";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PILL,
  PILL_ACTIVE,
  PILL_IDLE,
} from "@/components/workspace/chrome-styles";
import { useIsDark } from "@/hooks/use-is-dark";
import { galleryVars, type ThemeMode } from "@/lib/color/tokens";
import { cn } from "@/lib/utils";
import { ChartsView } from "./charts-view";
import { ComponentsView } from "./components-view";
import { DashboardView } from "./dashboard-view";
import { MarketingView } from "./marketing-view";

const SUB_VIEWS = ["components", "dashboard", "charts", "marketing"] as const;

type SubView = (typeof SUB_VIEWS)[number];

/** Spelled out, not composed, so `tolgee extract` can see the keys. */
function useSubViewLabels(): Record<SubView, string> {
  const { t } = useTranslate();

  return {
    charts: t("gallery.charts"),
    components: t("gallery.components"),
    dashboard: t("gallery.dashboard"),
    marketing: t("gallery.marketing"),
  };
}

/**
 * Cards flow into as many 268px columns as fit, packed with no vertical gaps.
 *
 * SPEC §4 calls for a grid and warns off multi-column ("pushes cards into
 * off-canvas columns and clips them"), but a grid cannot close the gaps under
 * short cards — that needs masonry, which CSS grid still does not ship. The
 * prototype's clipping came from a height-constrained container; this one is
 * auto-height inside the page scroll, and each card is break-inside: avoid.
 * Verified: no clipping, no horizontal overflow.
 */
const CARD_GRID =
  "columns-[268px] gap-5 [&>*]:mb-5 [&>*]:block [&>*]:w-full [&>*]:break-inside-avoid";
/**
 * Dashboard blocks are full-bleed by nature, so they stack instead of tiling.
 * Marketing stacks too, but for the opposite reason: it brings its own wider
 * column flow and a caption underneath, so the shared grid would fight it.
 */
const BLOCK_STACK = "flex flex-col gap-5";
const STACKED: readonly SubView[] = ["dashboard", "marketing"];

/**
 * The card chrome from the design, applied to every shadcn card in the gallery.
 *
 * The frame stays neutral — `--border-subtle` is the app's slate, not a palette
 * step — so the container reads as paper and the palette lives in the content.
 * Title and body come off the ramp itself — step 950 as text in light, step 50
 * in dark — which is the point of the exercise. See `themeVars`.
 */
const CARD_CHROME = [
  "[&_[data-slot=card]]:[--card-spacing:20px]",
  "[&_[data-slot=card]]:rounded-[20px]",
  "[&_[data-slot=card]]:border",
  "[&_[data-slot=card]]:border-[var(--border-subtle)]",
  "[&_[data-slot=card]]:bg-[var(--surface-card)]",
  "[&_[data-slot=card]]:shadow-[var(--shadow-xs)]",
  "[&_[data-slot=card]]:ring-0",
  "[&_[data-slot=card-title]]:font-normal",
  "[&_[data-slot=card-title]]:text-[15px]",
  "[&_[data-slot=card-title]]:text-[var(--fw-card-title)]",
  "[&_[data-slot=card-description]]:text-[12px]",
  "[&_[data-slot=card-description]]:text-[var(--fw-card-desc)]",
  // The reference has no tinted footer band; the action just sits in the card.
  "[&_[data-slot=card-footer]]:border-t-0",
  "[&_[data-slot=card-footer]]:bg-transparent",
].join(" ");

export interface PaletteGalleryProps {
  className?: string;
  mode?: ThemeMode;
}

export function PaletteGallery({ mode, className }: PaletteGalleryProps) {
  const { t } = useTranslate();
  const subViewLabels = useSubViewLabels();
  const isDark = useIsDark();
  const { scales } = usePalette();
  const [view, setView] = useState<SubView>("components");

  // Closes SPEC gap 3: the prototype only reskinned the app chrome and left
  // the gallery permanently light, so dark surfaces went untested.
  const galleryMode: ThemeMode = mode ?? (isDark ? "dark" : "light");

  const handleViewChange = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const { view: next } = event.currentTarget.dataset;
      if (next) {
        setView(next as SubView);
      }
    },
    []
  );

  const style = useMemo(
    () => galleryVars(scales, galleryMode) as CSSProperties,
    [scales, galleryMode]
  );

  return (
    <section className={cn("flex flex-col gap-5", className)} style={style}>
      {/*
        Plain buttons, as in the reference. ToggleGroup carries an
        `aria-pressed:bg-muted` of its own, and inside the gallery `--muted` is
        a palette step — so the selected pill kept painting itself pale.
      */}
      <fieldset className="flex flex-wrap gap-1.5 self-start">
        <legend className="sr-only">{t("gallery.view")}</legend>
        {SUB_VIEWS.map((item) => (
          <button
            aria-pressed={view === item}
            className={cn(
              PILL,
              "px-4 py-2 uppercase tracking-[0.12em]",
              view === item ? PILL_ACTIVE : PILL_IDLE
            )}
            data-view={item}
            key={item}
            onClick={handleViewChange}
            type="button"
          >
            {subViewLabels[item]}
          </button>
        ))}
      </fieldset>

      <div
        className={cn(
          STACKED.includes(view) ? BLOCK_STACK : CARD_GRID,
          CARD_CHROME
        )}
      >
        {/*
          The dashboard and the charts pull recharts in on demand, so the first
          switch to either one suspends while that chunk downloads. Everything
          after it is served from the resolved module and renders straight away.
        */}
        <Suspense
          fallback={<Skeleton className="h-64 w-full rounded-[20px]" />}
        >
          {view === "components" ? <ComponentsView /> : null}
          {view === "dashboard" ? <DashboardView /> : null}
          {view === "charts" ? <ChartsView /> : null}
          {view === "marketing" ? <MarketingView /> : null}
        </Suspense>
      </div>
    </section>
  );
}
