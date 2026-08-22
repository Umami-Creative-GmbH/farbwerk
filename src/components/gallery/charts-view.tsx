/**
 * The "Charts" sub-view, built on the shadcn chart package.
 *
 * Every series colour is `var(--chart-N)`, which the gallery wrapper points at
 * the palette — so a chart repaints from a slider without knowing anything
 * about the palette itself. The five chart tokens are spread across all three
 * ramps, which is the point of showing twelve different shapes: a palette that
 * reads fine as two bars can still fall apart across a stacked area, a donut
 * and a scatter.
 */
import { useTranslate } from "@tolgee/react";
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
  ChartLegendContent,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useRecharts } from "@/components/ui/recharts";

const CHART_BOX = "min-h-48 w-full";

const CHART_IDS = [
  "compare",
  "coverage",
  "devices",
  "goal",
  "latency",
  "ledger",
  "plans",
  "retention",
  "sources",
  "stacked",
  "traffic",
  "trend",
] as const;

type ChartId = (typeof CHART_IDS)[number];

/** Spelled out, not composed, so `tolgee extract` can see the keys. */
function useChartCopy(): Record<ChartId, { desc: string; title: string }> {
  const { t } = useTranslate();

  return {
    compare: {
      desc: t("gallery.charts.compare-desc"),
      title: t("gallery.charts.compare-title"),
    },
    coverage: {
      desc: t("gallery.charts.coverage-desc"),
      title: t("gallery.charts.coverage-title"),
    },
    devices: {
      desc: t("gallery.charts.devices-desc"),
      title: t("gallery.charts.devices-title"),
    },
    goal: {
      desc: t("gallery.charts.goal-desc"),
      title: t("gallery.charts.goal-title"),
    },
    latency: {
      desc: t("gallery.charts.latency-desc"),
      title: t("gallery.charts.latency-title"),
    },
    ledger: {
      desc: t("gallery.charts.ledger-desc"),
      title: t("gallery.charts.ledger-title"),
    },
    plans: {
      desc: t("gallery.charts.plans-desc"),
      title: t("gallery.charts.plans-title"),
    },
    retention: {
      desc: t("gallery.charts.retention-desc"),
      title: t("gallery.charts.retention-title"),
    },
    sources: {
      desc: t("gallery.charts.sources-desc"),
      title: t("gallery.charts.sources-title"),
    },
    stacked: {
      desc: t("gallery.charts.stacked-desc"),
      title: t("gallery.charts.stacked-title"),
    },
    traffic: {
      desc: t("gallery.charts.traffic-desc"),
      title: t("gallery.charts.traffic-title"),
    },
    trend: {
      desc: t("gallery.charts.trend-desc"),
      title: t("gallery.charts.trend-title"),
    },
  };
}

const TRAFFIC = [
  { day: "Mon", signups: 1400, visits: 4200 },
  { day: "Tue", signups: 2100, visits: 6800 },
  { day: "Wed", signups: 1700, visits: 5400 },
  { day: "Thu", signups: 3100, visits: 8800 },
  { day: "Fri", signups: 2400, visits: 7100 },
  { day: "Sat", signups: 900, visits: 3600 },
  { day: "Sun", signups: 700, visits: 3100 },
];

const SOURCES = [
  { fill: "var(--chart-1)", sessions: 4820, source: "direct" },
  { fill: "var(--chart-2)", sessions: 3140, source: "search" },
  { fill: "var(--chart-3)", sessions: 1960, source: "social" },
  { fill: "var(--chart-4)", sessions: 1180, source: "referral" },
];

const RETENTION = [
  { returning: 92, week: "W1" },
  { returning: 78, week: "W2" },
  { returning: 71, week: "W3" },
  { returning: 64, week: "W4" },
  { returning: 61, week: "W5" },
  { returning: 58, week: "W6" },
];

const DEVICES = [
  { desktop: 2400, mobile: 1800, month: "Mar", tablet: 600 },
  { desktop: 2600, mobile: 2200, month: "Apr", tablet: 640 },
  { desktop: 2500, mobile: 2600, month: "May", tablet: 700 },
  { desktop: 2900, mobile: 3100, month: "Jun", tablet: 720 },
  { desktop: 3100, mobile: 3600, month: "Jul", tablet: 810 },
  { desktop: 3300, mobile: 4100, month: "Aug", tablet: 860 },
];

const LEDGER = [
  { cost: 2100, month: "Mar", revenue: 4200 },
  { cost: 2300, month: "Apr", revenue: 5100 },
  { cost: 2200, month: "May", revenue: 4800 },
  { cost: 2600, month: "Jun", revenue: 6400 },
  { cost: 2800, month: "Jul", revenue: 7200 },
  { cost: 2900, month: "Aug", revenue: 8100 },
];

const PLANS = [
  { fill: "var(--chart-1)", plan: "Solo", share: 46 },
  { fill: "var(--chart-2)", plan: "Studio", share: 38 },
  { fill: "var(--chart-3)", plan: "Agency", share: 16 },
];

const LATENCY = [
  { latency: 120, requests: 220 },
  { latency: 148, requests: 380 },
  { latency: 132, requests: 300 },
  { latency: 210, requests: 640 },
  { latency: 186, requests: 520 },
  { latency: 268, requests: 810 },
  { latency: 240, requests: 720 },
  { latency: 305, requests: 940 },
];

const COVERAGE = [
  { score: 82, source: "direct" },
  { score: 64, source: "search" },
  { score: 91, source: "social" },
  { score: 55, source: "referral" },
];

const GOAL = [{ completed: 74, fill: "var(--chart-1)", name: "goal" }];
const GOAL_PERCENT = 74;
const RADIAL_INNER = 62;
const RADIAL_OUTER = 92;
const DONUT_INNER_RADIUS = 58;
const CATEGORY_AXIS_WIDTH = 36;
const SCATTER_DOT_RANGE = [60, 60] as const;

const TOTAL_SESSIONS = SOURCES.reduce((sum, row) => sum + row.sessions, 0);

/** One card shell, so twelve charts stay visually identical. */
function ChartCard({
  chart,
  children,
  config,
}: {
  chart: ChartId;
  children: React.ComponentProps<typeof ChartContainer>["children"];
  config: ChartConfig;
}) {
  const copy = useChartCopy()[chart];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.title}</CardTitle>
        <CardDescription>{copy.desc}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className={CHART_BOX} config={config}>
          {children}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function TrafficChart() {
  const {
    Bar,
    BarChart,
    CartesianGrid,
    Legend: ChartLegend,
    Tooltip: ChartTooltip,
    XAxis,
  } = useRecharts();
  const { t } = useTranslate();
  const config = {
    signups: { color: "var(--chart-2)", label: t("gallery.charts.signups") },
    visits: { color: "var(--chart-1)", label: t("gallery.charts.visits") },
  } satisfies ChartConfig;

  return (
    <ChartCard chart="traffic" config={config}>
      <BarChart accessibilityLayer data={TRAFFIC}>
        <CartesianGrid vertical={false} />
        <XAxis axisLine={false} dataKey="day" tickLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="visits" fill="var(--color-visits)" radius={4} />
        <Bar dataKey="signups" fill="var(--color-signups)" radius={4} />
      </BarChart>
    </ChartCard>
  );
}

function StackedBarChart() {
  const {
    Bar,
    BarChart,
    CartesianGrid,
    Tooltip: ChartTooltip,
    XAxis,
  } = useRecharts();
  const { t } = useTranslate();
  const config = {
    signups: { color: "var(--chart-3)", label: t("gallery.charts.signups") },
    visits: { color: "var(--chart-1)", label: t("gallery.charts.visits") },
  } satisfies ChartConfig;

  return (
    <ChartCard chart="stacked" config={config}>
      <BarChart accessibilityLayer data={TRAFFIC}>
        <CartesianGrid vertical={false} />
        <XAxis axisLine={false} dataKey="day" tickLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
        <Bar dataKey="visits" fill="var(--color-visits)" stackId="a" />
        <Bar
          dataKey="signups"
          fill="var(--color-signups)"
          radius={[4, 4, 0, 0]}
          stackId="a"
        />
      </BarChart>
    </ChartCard>
  );
}

function SourcesChart() {
  const {
    Cell,
    Label,
    Legend: ChartLegend,
    Pie,
    PieChart,
    Tooltip: ChartTooltip,
  } = useRecharts();
  const { t } = useTranslate();
  const config = {
    direct: { color: "var(--chart-1)", label: t("gallery.charts.direct") },
    referral: { color: "var(--chart-4)", label: t("gallery.charts.referral") },
    search: { color: "var(--chart-2)", label: t("gallery.charts.search") },
    sessions: { label: t("gallery.charts.sessions") },
    social: { color: "var(--chart-3)", label: t("gallery.charts.social") },
  } satisfies ChartConfig;

  return (
    <ChartCard chart="sources" config={config}>
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
          content={
            <ChartLegendContent
              className="-translate-y-2 flex-wrap gap-2"
              nameKey="source"
            />
          }
        />
      </PieChart>
    </ChartCard>
  );
}

function PlanMixChart() {
  const {
    Cell,
    Legend: ChartLegend,
    Pie,
    PieChart,
    Tooltip: ChartTooltip,
  } = useRecharts();
  const { t } = useTranslate();
  const config = {
    Agency: { color: "var(--chart-3)", label: "Agency" },
    Solo: { color: "var(--chart-1)", label: "Solo" },
    Studio: { color: "var(--chart-2)", label: "Studio" },
    share: { label: t("gallery.charts.share") },
  } satisfies ChartConfig;

  return (
    <ChartCard chart="plans" config={config}>
      <PieChart>
        <ChartTooltip
          content={<ChartTooltipContent hideLabel nameKey="plan" />}
          cursor={false}
        />
        <Pie data={PLANS} dataKey="share" nameKey="plan" strokeWidth={2}>
          {PLANS.map((entry) => (
            <Cell fill={entry.fill} key={entry.plan} />
          ))}
        </Pie>
        <ChartLegend
          content={
            <ChartLegendContent
              className="-translate-y-2 flex-wrap gap-2"
              nameKey="plan"
            />
          }
        />
      </PieChart>
    </ChartCard>
  );
}

function RetentionChart() {
  const {
    Bar,
    BarChart,
    CartesianGrid,
    Tooltip: ChartTooltip,
    XAxis,
    YAxis,
  } = useRecharts();
  const { t } = useTranslate();
  const config = {
    returning: {
      color: "var(--chart-3)",
      label: t("gallery.charts.returning"),
    },
  } satisfies ChartConfig;

  return (
    <ChartCard chart="retention" config={config}>
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
    </ChartCard>
  );
}

function SignupTrendChart() {
  const {
    CartesianGrid,
    Line,
    LineChart,
    Tooltip: ChartTooltip,
    XAxis,
  } = useRecharts();
  const { t } = useTranslate();
  const config = {
    signups: { color: "var(--chart-2)", label: t("gallery.charts.signups") },
  } satisfies ChartConfig;

  return (
    <ChartCard chart="trend" config={config}>
      <LineChart accessibilityLayer data={TRAFFIC}>
        <CartesianGrid vertical={false} />
        <XAxis axisLine={false} dataKey="day" tickLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
        <Line
          dataKey="signups"
          dot={false}
          stroke="var(--color-signups)"
          strokeWidth={2}
          type="monotone"
        />
      </LineChart>
    </ChartCard>
  );
}

function MultiLineChart() {
  const {
    CartesianGrid,
    Legend: ChartLegend,
    Line,
    LineChart,
    Tooltip: ChartTooltip,
    XAxis,
  } = useRecharts();
  const { t } = useTranslate();
  const config = {
    signups: { color: "var(--chart-2)", label: t("gallery.charts.signups") },
    visits: { color: "var(--chart-1)", label: t("gallery.charts.visits") },
  } satisfies ChartConfig;

  return (
    <ChartCard chart="compare" config={config}>
      <LineChart accessibilityLayer data={TRAFFIC}>
        <CartesianGrid vertical={false} />
        <XAxis axisLine={false} dataKey="day" tickLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          dataKey="visits"
          dot={false}
          stroke="var(--color-visits)"
          strokeWidth={2}
          type="step"
        />
        <Line
          dataKey="signups"
          dot={false}
          stroke="var(--color-signups)"
          strokeWidth={2}
          type="step"
        />
      </LineChart>
    </ChartCard>
  );
}

function DeviceAreaChart() {
  const {
    Area,
    AreaChart,
    CartesianGrid,
    Legend: ChartLegend,
    Tooltip: ChartTooltip,
    XAxis,
  } = useRecharts();
  const { t } = useTranslate();
  const config = {
    desktop: { color: "var(--chart-1)", label: t("gallery.charts.desktop") },
    mobile: { color: "var(--chart-2)", label: t("gallery.charts.mobile") },
    tablet: { color: "var(--chart-3)", label: t("gallery.charts.tablet") },
  } satisfies ChartConfig;

  return (
    <ChartCard chart="devices" config={config}>
      <AreaChart accessibilityLayer data={DEVICES}>
        <CartesianGrid vertical={false} />
        <XAxis
          axisLine={false}
          dataKey="month"
          tickLine={false}
          tickMargin={8}
        />
        <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
        <ChartLegend content={<ChartLegendContent />} />
        <Area
          dataKey="desktop"
          fill="var(--color-desktop)"
          fillOpacity={0.4}
          stackId="a"
          stroke="var(--color-desktop)"
          type="natural"
        />
        <Area
          dataKey="mobile"
          fill="var(--color-mobile)"
          fillOpacity={0.4}
          stackId="a"
          stroke="var(--color-mobile)"
          type="natural"
        />
        <Area
          dataKey="tablet"
          fill="var(--color-tablet)"
          fillOpacity={0.4}
          stackId="a"
          stroke="var(--color-tablet)"
          type="natural"
        />
      </AreaChart>
    </ChartCard>
  );
}

function LedgerChart() {
  const {
    Bar,
    CartesianGrid,
    ComposedChart,
    Legend: ChartLegend,
    Line,
    Tooltip: ChartTooltip,
    XAxis,
  } = useRecharts();
  const { t } = useTranslate();
  const config = {
    cost: { color: "var(--chart-4)", label: t("gallery.charts.cost") },
    revenue: { color: "var(--chart-1)", label: t("gallery.charts.revenue") },
  } satisfies ChartConfig;

  return (
    <ChartCard chart="ledger" config={config}>
      <ComposedChart accessibilityLayer data={LEDGER}>
        <CartesianGrid vertical={false} />
        <XAxis
          axisLine={false}
          dataKey="month"
          tickLine={false}
          tickMargin={8}
        />
        <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
        <Line
          dataKey="cost"
          dot={false}
          stroke="var(--color-cost)"
          strokeWidth={2}
          type="monotone"
        />
      </ComposedChart>
    </ChartCard>
  );
}

function CoverageChart() {
  const {
    PolarAngleAxis,
    PolarGrid,
    Radar,
    RadarChart,
    Tooltip: ChartTooltip,
  } = useRecharts();
  const { t } = useTranslate();
  const config = {
    score: { color: "var(--chart-3)", label: t("gallery.charts.score") },
  } satisfies ChartConfig;

  return (
    <ChartCard chart="coverage" config={config}>
      <RadarChart data={COVERAGE}>
        <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
        <PolarGrid />
        <PolarAngleAxis dataKey="source" />
        <Radar
          dataKey="score"
          fill="var(--color-score)"
          fillOpacity={0.5}
          stroke="var(--color-score)"
        />
      </RadarChart>
    </ChartCard>
  );
}

function GoalChart() {
  const { Label, PolarGrid, RadialBar, RadialBarChart } = useRecharts();
  const { t } = useTranslate();
  const config = {
    completed: {
      color: "var(--chart-1)",
      label: t("gallery.charts.completed"),
    },
  } satisfies ChartConfig;

  return (
    <ChartCard chart="goal" config={config}>
      <RadialBarChart
        data={GOAL}
        endAngle={GOAL_PERCENT * 3.6 - 90}
        innerRadius={RADIAL_INNER}
        outerRadius={RADIAL_OUTER}
        startAngle={-90}
      >
        <PolarGrid
          gridType="circle"
          polarRadius={[66, 58]}
          radialLines={false}
        />
        <RadialBar background cornerRadius={8} dataKey="completed" />
        <Label
          className="fill-[var(--fw-card-title)] font-mono text-xl"
          position="center"
          value={`${GOAL_PERCENT}%`}
        />
      </RadialBarChart>
    </ChartCard>
  );
}

function LatencyChart() {
  const {
    CartesianGrid,
    Scatter,
    ScatterChart,
    Tooltip: ChartTooltip,
    XAxis,
    YAxis,
    ZAxis,
  } = useRecharts();
  const { t } = useTranslate();
  const config = {
    latency: { color: "var(--chart-2)", label: t("gallery.charts.latency") },
    requests: { label: t("gallery.charts.requests") },
  } satisfies ChartConfig;

  return (
    <ChartCard chart="latency" config={config}>
      <ScatterChart accessibilityLayer data={LATENCY}>
        <CartesianGrid />
        <XAxis
          axisLine={false}
          dataKey="requests"
          tickLine={false}
          tickMargin={8}
          type="number"
        />
        <YAxis
          axisLine={false}
          dataKey="latency"
          tickLine={false}
          tickMargin={8}
          type="number"
          width={CATEGORY_AXIS_WIDTH}
        />
        <ZAxis range={[...SCATTER_DOT_RANGE]} />
        <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
        <Scatter dataKey="latency" fill="var(--color-latency)" />
      </ScatterChart>
    </ChartCard>
  );
}

export function ChartsView() {
  return (
    <>
      <TrafficChart />
      <SourcesChart />
      <RetentionChart />
      <SignupTrendChart />
      <DeviceAreaChart />
      <LedgerChart />
      <StackedBarChart />
      <CoverageChart />
      <GoalChart />
      <PlanMixChart />
      <LatencyChart />
      <MultiLineChart />
    </>
  );
}
