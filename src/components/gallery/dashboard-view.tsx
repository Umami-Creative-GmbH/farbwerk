/**
 * The "Dashboard" sub-view.
 *
 * The first three entries are the installed dashboard-01 block — the point of
 * the token remap is that real application blocks repaint from a generated
 * palette. The last two are marketing-shaped blocks composed from the same
 * primitives.
 *
 * The blocks are stock apart from one addition: the area chart takes a
 * `showTertiary` prop, because a palette's third scale had nowhere to land in
 * a two-series chart. Everything else they need is reached from the outside,
 * through tokens and the wrapper classes below.
 */

import { useTranslate } from "@tolgee/react";
import dashboardData from "@/app/dashboard/data.json";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { usePalette } from "@/components/palette/palette-context";
import { SectionCards } from "@/components/section-cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Prices and plan names are brand nouns; only the notes are translated. */
const PLANS = [
  { featured: false, id: "solo", name: "Solo", price: "€0" },
  { featured: true, id: "studio", name: "Studio", price: "€18" },
  { featured: false, id: "agency", name: "Agency", price: "€49" },
] as const;

const TABLE_ROWS = 8;

/** Spelled out, not composed, so `tolgee extract` can see the keys. */
function usePlanNotes(): Record<(typeof PLANS)[number]["id"], string> {
  const { t } = useTranslate();

  return {
    agency: t("gallery.plans.agency-note"),
    solo: t("gallery.plans.solo-note"),
    studio: t("gallery.plans.studio-note"),
  };
}

/**
 * Cancels the page gutter dashboard-01's blocks carry inside themselves.
 *
 * `SectionCards` and `DataTable` both pad with `px-4 lg:px-6`, because in the
 * real dashboard they sit edge to edge in a shell that provides none. Here
 * their neighbours are plain cards with no gutter, so the block sat visibly
 * inset from everything around it — and the documents table, squeezed into
 * 48px less than its columns need, lost its last one behind a scrollbar.
 *
 * Giving the width back with a negative margin keeps the vendored blocks
 * byte-identical, which is the whole premise of the view.
 */
const FLUSH = "-mx-4 lg:-mx-6";

/**
 * Re-aims that same gutter at the card padding instead of at zero.
 *
 * Inside a card the table should sit level with the header text rather than
 * run to the card's edge, so the margin here is the difference between the
 * block's own gutter and `--card-spacing` — leaving its padding to land
 * exactly on the card spacing at both breakpoints.
 */
const CARD_ALIGNED =
  "mx-[calc(var(--card-spacing)-1rem)] lg:mx-[calc(var(--card-spacing)-1.5rem)]";

/**
 * The table's toolbar is decoration here, not a control surface.
 *
 * Its tabs, column menu and "Add Section" all drive a table that exists only to
 * show the palette on a real data grid — clicking a tab swapped the rows out
 * for an empty placeholder panel, which reads as a broken preview. Switching it
 * off from the outside leaves `DataTable` stock, the same way the palette
 * reaches it through tokens rather than through edits.
 */
const OPTICAL_TOOLBAR =
  "[&_[data-slot=tabs]>div:first-child]:pointer-events-none";

/**
 * Both blocks reference `var(--primary)` and nothing else, so a dashboard
 * painted from a three-scale palette still reads as a single hue. These two
 * classes re-point the colour hooks each block exposes at the secondary and
 * tertiary ramps; the rules live in `styles.css`, because Tailwind drops an
 * arbitrary property whose value is a `var()`. With a single-scale palette the
 * other roles resolve back to primary, so nothing changes — see `resolveScales`.
 */
const CHART_RAMPS = "fw-chart-ramps";
const STAT_RAMPS = "fw-stat-ramps";

function PricingRow() {
  const { t } = useTranslate();
  const planNotes = usePlanNotes();

  return (
    // Card drops its own bottom padding whenever it *contains* a card footer,
    // on the assumption the footer supplies that edge. Here the footers belong
    // to the nested plan cards, so the outer card has to ask for it back — and
    // needs `!` to outrank that rule's `:has()` selector.
    <Card className="pb-(--card-spacing)!">
      <CardHeader>
        <CardTitle>{t("gallery.plans.title")}</CardTitle>
        <CardDescription>{t("gallery.plans.desc")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => (
          <Card
            className="data-[featured=true]:border-primary data-[featured=true]:ring-1 data-[featured=true]:ring-primary"
            data-featured={plan.featured}
            key={plan.id}
          >
            <CardHeader>
              <CardDescription>{plan.name}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">
                {plan.price}
              </CardTitle>
              {plan.featured ? (
                <CardAction>
                  <Badge>{t("gallery.plans.popular")}</Badge>
                </CardAction>
              ) : null}
            </CardHeader>
            <CardFooter className="flex-col items-start gap-3">
              <p className="text-muted-foreground text-sm">
                {planNotes[plan.id]}
              </p>
              <Button
                className="w-full"
                size="sm"
                variant={plan.featured ? "default" : "outline"}
              >
                {t("gallery.plans.choose", { plan: plan.name })}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}

function NewsletterCta() {
  const { t } = useTranslate();

  return (
    <Card className="bg-primary text-primary-foreground">
      <CardHeader>
        <CardTitle>{t("gallery.newsletter.title")}</CardTitle>
        <CardDescription className="text-primary-foreground/80">
          {t("gallery.newsletter.desc")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-2">
          <Label className="text-primary-foreground" htmlFor="newsletter-email">
            {t("gallery.newsletter.email")}
          </Label>
          <Input
            className="bg-background text-foreground"
            id="newsletter-email"
            placeholder="you@studio.com"
            type="email"
          />
        </div>
        <Button className="sm:w-auto" variant="secondary">
          {t("gallery.newsletter.subscribe")}
        </Button>
      </CardContent>
    </Card>
  );
}

export function DashboardView() {
  const { t } = useTranslate();
  const { scales } = usePalette();

  // Both, not just the tertiary: a third band is only worth drawing when every
  // role resolves to its own scale. Otherwise `resolveScales` would fall back
  // and paint it in a hue already on the chart.
  const hasThreeScales = Boolean(scales.secondary && scales.tertiary);

  return (
    // dashboard-01's stat cards lay themselves out with `@5xl/main` container
    // queries, so they need the named container their block normally sits in.
    <div className="@container/main flex flex-col gap-5">
      <div className={`${FLUSH} ${STAT_RAMPS}`}>
        <SectionCards />
      </div>
      <div className={CHART_RAMPS}>
        <ChartAreaInteractive showTertiary={hasThreeScales} />
      </div>
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>{t("gallery.documents.title")}</CardTitle>
          <CardDescription>{t("gallery.documents.desc")}</CardDescription>
        </CardHeader>
        {/* px-0 defers the inset to CARD_ALIGNED, which lands on the same
            spacing as the header rather than doubling it. */}
        <CardContent className="px-0">
          <div className={`${CARD_ALIGNED} ${OPTICAL_TOOLBAR}`}>
            <DataTable data={dashboardData.slice(0, TABLE_ROWS)} />
          </div>
        </CardContent>
      </Card>
      <PricingRow />
      <NewsletterCta />
    </div>
  );
}
