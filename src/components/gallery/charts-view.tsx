/**
 * The "Charts" sub-view, built on the shadcn chart package.
 *
 * Every series colour is `var(--chart-N)`, which the gallery wrapper points at
 * the palette — so a chart repaints from a slider without knowing anything
 * about the palette itself.
 */
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const TRAFFIC = [
  { day: "Mon", signups: 1400, visits: 4200 },
  { day: "Tue", signups: 2100, visits: 6800 },
  { day: "Wed", signups: 1700, visits: 5400 },
  { day: "Thu", signups: 3100, visits: 8800 },
  { day: "Fri", signups: 2400, visits: 7100 },
  { day: "Sat", signups: 900, visits: 3600 },
  { day: "Sun", signups: 700, visits: 3100 },
];

const TRAFFIC_CONFIG = {
  signups: { color: "var(--chart-2)", label: "Signups" },
  visits: { color: "var(--chart-1)", label: "Visits" },
} satisfies ChartConfig;

const SOURCES = [
  { fill: "var(--chart-1)", sessions: 4820, source: "direct" },
  { fill: "var(--chart-2)", sessions: 3140, source: "search" },
  { fill: "var(--chart-3)", sessions: 1960, source: "social" },
  { fill: "var(--chart-4)", sessions: 1180, source: "referral" },
];

const SOURCES_CONFIG = {
  direct: { color: "var(--chart-1)", label: "Direct" },
  referral: { color: "var(--chart-4)", label: "Referral" },
  search: { color: "var(--chart-2)", label: "Search" },
  sessions: { label: "Sessions" },
  social: { color: "var(--chart-3)", label: "Social" },
} satisfies ChartConfig;

const TOTAL_SESSIONS = SOURCES.reduce((sum, row) => sum + row.sessions, 0);

const RETENTION = [
  { returning: 92, week: "W1" },
  { returning: 78, week: "W2" },
  { returning: 71, week: "W3" },
  { returning: 64, week: "W4" },
  { returning: 61, week: "W5" },
  { returning: 58, week: "W6" },
];

const RETENTION_CONFIG = {
  returning: { color: "var(--chart-3)", label: "Returning" },
} satisfies ChartConfig;

const DONUT_INNER_RADIUS = 58;
const CATEGORY_AXIS_WIDTH = 36;

function TrafficChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly traffic</CardTitle>
        <CardDescription>Visits against signups.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className="min-h-48 w-full" config={TRAFFIC_CONFIG}>
          <BarChart accessibilityLayer data={TRAFFIC}>
            <CartesianGrid vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="day"
              tickLine={false}
              tickMargin={8}
            />
            <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="visits" fill="var(--color-visits)" radius={4} />
            <Bar dataKey="signups" fill="var(--color-signups)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function SourcesChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sessions by source</CardTitle>
        <CardDescription>All three ramps at once.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          className="mx-auto min-h-48 w-full"
          config={SOURCES_CONFIG}
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent hideLabel nameKey="source" />}
              cursor={false}
            />
            <Pie
              data={SOURCES}
              dataKey="sessions"
              innerRadius={DONUT_INNER_RADIUS}
              nameKey="source"
              strokeWidth={2}
            >
              {SOURCES.map((entry) => (
                <Cell fill={entry.fill} key={entry.source} />
              ))}
              <Label
                position="center"
                value={TOTAL_SESSIONS.toLocaleString("en-US")}
              />
            </Pie>
            <ChartLegend
              className="-translate-y-2 flex-wrap gap-2"
              content={<ChartLegendContent nameKey="source" />}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function RetentionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Retention</CardTitle>
        <CardDescription>Share of users coming back.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className="min-h-48 w-full" config={RETENTION_CONFIG}>
          <BarChart accessibilityLayer data={RETENTION} layout="vertical">
            <CartesianGrid horizontal={false} />
            <YAxis
              axisLine={false}
              dataKey="week"
              tickLine={false}
              tickMargin={4}
              type="category"
              width={CATEGORY_AXIS_WIDTH}
            />
            <XAxis hide type="number" />
            <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
            <Bar dataKey="returning" fill="var(--color-returning)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function ChartsView() {
  return (
    <>
      <TrafficChart />
      <SourcesChart />
      <RetentionChart />
    </>
  );
}
