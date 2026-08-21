/**
 * The "Blocks" sub-view.
 *
 * The first three entries are the installed dashboard-01 block, dropped in
 * unmodified — that is the point of the token remap: real application blocks
 * repaint from a generated palette without a single edit. The last two are
 * marketing-shaped blocks composed from the same primitives.
 */

import dashboardData from "@/app/dashboard/data.json";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
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

const PLANS = [
  {
    featured: false,
    id: "solo",
    name: "Solo",
    note: "One palette, local only",
    price: "€0",
  },
  {
    featured: true,
    id: "studio",
    name: "Studio",
    note: "Shared palettes and exports",
    price: "€18",
  },
  {
    featured: false,
    id: "agency",
    name: "Agency",
    note: "Design system sync",
    price: "€49",
  },
] as const;

const TABLE_ROWS = 8;

function PricingRow() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Plans</CardTitle>
        <CardDescription>
          One accent carries the recommended plan.
        </CardDescription>
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
                  <Badge>Popular</Badge>
                </CardAction>
              ) : null}
            </CardHeader>
            <CardFooter className="flex-col items-start gap-3">
              <p className="text-muted-foreground text-sm">{plan.note}</p>
              <Button
                className="w-full"
                size="sm"
                variant={plan.featured ? "default" : "outline"}
              >
                Choose {plan.name}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}

function NewsletterCta() {
  return (
    <Card className="bg-primary text-primary-foreground">
      <CardHeader>
        <CardTitle>Ship the palette</CardTitle>
        <CardDescription className="text-primary-foreground/80">
          Get the export formats as soon as they land.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-2">
          <Label className="text-primary-foreground" htmlFor="newsletter-email">
            Email
          </Label>
          <Input
            className="bg-background text-foreground"
            id="newsletter-email"
            placeholder="you@studio.com"
            type="email"
          />
        </div>
        <Button className="sm:w-auto" variant="secondary">
          Subscribe
        </Button>
      </CardContent>
    </Card>
  );
}

export function BlocksView() {
  return (
    // dashboard-01's stat cards lay themselves out with `@5xl/main` container
    // queries, so they need the named container their block normally sits in.
    <div className="@container/main flex flex-col gap-5">
      <SectionCards />
      <ChartAreaInteractive />
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>The dashboard-01 table, unmodified.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <DataTable data={dashboardData.slice(0, TABLE_ROWS)} />
        </CardContent>
      </Card>
      <PricingRow />
      <NewsletterCta />
    </div>
  );
}
