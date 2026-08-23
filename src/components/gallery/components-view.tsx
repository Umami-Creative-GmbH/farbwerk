/**
 * The "Components" sub-view: cards built from the project's own shadcn
 * primitives. Nothing here sets a color of its own — every surface, accent,
 * ring and status colour comes from the theme tokens the gallery wrapper remaps
 * onto the palette.
 *
 * The point of the spread is coverage: buttons, inputs, selection controls,
 * overlays, data display and loading states all repaint from one base color, so
 * a palette that looks fine on a button but falls apart on a table shows it
 * here.
 */

import { useTranslate } from "@tolgee/react";
import {
  BellIcon,
  CheckIcon,
  ChevronDownIcon,
  InfoIcon,
  MoreHorizontalIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { dateLocale } from "@/i18n/date-locale";
import { useLocale } from "@/i18n/use-locale";

const RELEASE_TASKS = [
  { done: true, id: "contrast" },
  { done: true, id: "anchor" },
  { done: false, id: "tokens" },
  { done: false, id: "surfaces" },
] as const;

const CATEGORIES = [
  { count: 128, id: "food", step: "--p-500" },
  { count: 74, id: "home", step: "--s-500" },
  { count: 41, id: "travel", step: "--t-500" },
  { count: 12, id: "studio", step: "--p-300" },
] as const;

const TEAM = [
  { id: "ah", initials: "AH" },
  { id: "mk", initials: "MK" },
  { id: "rs", initials: "RS" },
] as const;

const TABLE_ROWS = [
  { id: "brand", status: "done", value: "11" },
  { id: "marketing", status: "review", value: "8" },
  { id: "product", status: "blocked", value: "3" },
] as const;

const STATUS_VARIANT = {
  blocked: "destructive",
  done: "secondary",
  review: "outline",
} as const;

const DONE_COUNT = RELEASE_TASKS.filter((task) => task.done).length;
const DONE_PERCENT = Math.round((DONE_COUNT / RELEASE_TASKS.length) * 100);
const UPLOAD_PERCENT = 62;
const EXTRA_MEMBERS = 4;

/**
 * The gallery's demo copy, spelled out rather than composed from an id.
 *
 * `tolgee extract` only sees string literals, so a key built at runtime both
 * warns on every sync and is invisible to `--remove-unused` — which deletes it.
 */
function useTaskLabels(): Record<(typeof RELEASE_TASKS)[number]["id"], string> {
  const { t } = useTranslate();

  return {
    anchor: t("gallery.checklist.anchor"),
    contrast: t("gallery.checklist.contrast"),
    surfaces: t("gallery.checklist.surfaces"),
    tokens: t("gallery.checklist.tokens"),
  };
}

function useCategoryLabels(): Record<
  (typeof CATEGORIES)[number]["id"],
  string
> {
  const { t } = useTranslate();

  return {
    food: t("gallery.categories.food"),
    home: t("gallery.categories.home"),
    studio: t("gallery.categories.studio"),
    travel: t("gallery.categories.travel"),
  };
}

function useTableRowLabels(): Record<
  (typeof TABLE_ROWS)[number]["id"],
  string
> {
  const { t } = useTranslate();

  return {
    brand: t("gallery.table.brand"),
    marketing: t("gallery.table.marketing"),
    product: t("gallery.table.product"),
  };
}

function useStatusLabels(): Record<
  (typeof TABLE_ROWS)[number]["status"],
  string
> {
  const { t } = useTranslate();

  return {
    blocked: t("gallery.table.blocked"),
    done: t("gallery.table.done"),
    review: t("gallery.table.review"),
  };
}

/**
 * Calendar parts restyled to the reference: mono weekday initials off step 500,
 * an Outfit month label, and nav pills that show step 500 doing the work of an
 * action colour.
 *
 * These replace the component's defaults rather than merging — `classNames` is
 * spread last — so each value carries the layout classes it needs. Safe here:
 * nothing else keys off the `rdp-*` names, since this project styles the
 * calendar entirely with Tailwind and has RTL turned off.
 */
const CALENDAR_PARTS = {
  button_next:
    "flex size-[26px] select-none items-center justify-center rounded-full bg-[var(--p-500)] p-0 text-white transition-colors duration-150 hover:bg-[var(--p-600)] aria-disabled:opacity-50",
  button_previous:
    "flex size-6.5 select-none items-center justify-center rounded-full bg-(--p-50) p-0 text-(--p-700) transition-colors duration-150 hover:bg-(--p-100) aria-disabled:opacity-50",
  caption_label:
    "select-none font-heading text-[15px] text-(--fw-card-title)",
  weekday: "flex-1 select-none font-mono text-[10px] text-(--p-500)",
};

function CalendarCard() {
  const { t } = useTranslate();
  const locale = useLocale();
  const [date, setDate] = useState<Date | undefined>(undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("gallery.calendar.title")}</CardTitle>
        <CardDescription>{t("gallery.calendar.desc")}</CardDescription>
      </CardHeader>
      <CardContent>
        {/*
          No inner border: the card already is the frame, and the reference
          draws the calendar straight onto it. The cell shape comes from the
          two CSS variables the default day classes already read.
        */}
        <Calendar
          className="w-full p-0 [--cell-radius:9px] [--cell-size:34px]"
          classNames={CALENDAR_PARTS}
          locale={dateLocale(locale)}
          mode="single"
          onSelect={setDate}
          selected={date}
        />
      </CardContent>
    </Card>
  );
}

function ChecklistCard() {
  const { t } = useTranslate();
  const taskLabels = useTaskLabels();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("gallery.checklist.title")}</CardTitle>
        <CardDescription>
          {t("gallery.checklist.done", {
            done: DONE_COUNT,
            total: RELEASE_TASKS.length,
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Progress value={DONE_PERCENT} />
        <ul className="flex flex-col gap-3">
          {RELEASE_TASKS.map((task) => (
            <li className="flex items-center gap-3" key={task.id}>
              <Checkbox defaultChecked={task.done} id={`task-${task.id}`} />
              <Label
                className="font-normal text-sm data-[done=true]:text-muted-foreground data-[done=true]:line-through"
                data-done={task.done}
                htmlFor={`task-${task.id}`}
              >
                {taskLabels[task.id]}
              </Label>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full" size="sm">
          <CheckIcon />
          {t("gallery.checklist.cta")}
        </Button>
      </CardFooter>
    </Card>
  );
}

function FormStatesCard() {
  const { t } = useTranslate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("gallery.form.title")}</CardTitle>
        <CardDescription>{t("gallery.form.desc")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="palette-name">{t("sidebar.palette-name")}</Label>
          <Input defaultValue="Azure" id="palette-name" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="palette-base">{t("sidebar.base-color")}</Label>
          <Input aria-invalid="true" defaultValue="#00zz12" id="palette-base" />
          <p className="text-destructive text-xs">{t("gallery.form.error")}</p>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="palette-note">{t("gallery.form.note")}</Label>
          <Textarea
            defaultValue={t("gallery.form.note-value")}
            disabled
            id="palette-note"
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="palette-public">{t("gallery.form.public")}</Label>
          <Switch defaultChecked id="palette-public" />
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryListCard() {
  const { t } = useTranslate();
  const categoryLabels = useCategoryLabels();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("gallery.categories.title")}</CardTitle>
        <CardDescription>{t("gallery.categories.desc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col">
          {CATEGORIES.map((category) => (
            <li
              className="flex items-center gap-3 border-border border-b py-3 last:border-0"
              key={category.id}
            >
              <span
                aria-hidden="true"
                className="size-3 rounded-full"
                style={{ background: `var(${category.step})` }}
              />
              <span className="flex-1 text-sm">
                {categoryLabels[category.id]}
              </span>
              <Badge variant="secondary">{category.count}</Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function AlertsCard() {
  const { t } = useTranslate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("gallery.alerts.title")}</CardTitle>
        <CardDescription>{t("gallery.alerts.desc")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Alert>
          <InfoIcon />
          <AlertTitle>{t("gallery.alerts.info-title")}</AlertTitle>
          <AlertDescription>{t("gallery.alerts.info-desc")}</AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertTitle>{t("gallery.alerts.error-title")}</AlertTitle>
          <AlertDescription>{t("gallery.alerts.error-desc")}</AlertDescription>
        </Alert>
        <div className="flex flex-wrap gap-2">
          <Badge>{t("gallery.alerts.badge-default")}</Badge>
          <Badge variant="secondary">
            {t("gallery.alerts.badge-secondary")}
          </Badge>
          <Badge variant="outline">{t("gallery.alerts.badge-outline")}</Badge>
          <Badge variant="destructive">
            {t("gallery.alerts.badge-destructive")}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamCard() {
  const { t } = useTranslate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("gallery.team.title")}</CardTitle>
        <CardDescription>{t("gallery.team.desc")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <AvatarGroup>
          {TEAM.map((member) => (
            <Avatar key={member.id}>
              <AvatarFallback>{member.initials}</AvatarFallback>
            </Avatar>
          ))}
          <AvatarGroupCount>+{EXTRA_MEMBERS}</AvatarGroupCount>
        </AvatarGroup>
        <Separator />
        <div className="flex flex-col gap-3">
          <Label className={undefined} htmlFor="team-density">
            {t("gallery.team.density")}
          </Label>
          <ToggleGroup
            defaultValue={["cozy"]}
            id="team-density"
            multiple={false}
            variant="outline"
          >
            <ToggleGroupItem value="compact">
              {t("gallery.team.compact")}
            </ToggleGroupItem>
            <ToggleGroupItem value="cozy">
              {t("gallery.team.cozy")}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button size="sm" variant="outline">
          <BellIcon />
          {t("gallery.team.notify")}
        </Button>
        <Button size="sm">{t("gallery.team.invite")}</Button>
      </CardFooter>
    </Card>
  );
}

function TableCard() {
  const { t } = useTranslate();
  const rowLabels = useTableRowLabels();
  const statusLabels = useStatusLabels();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("gallery.table.title")}</CardTitle>
        <CardDescription>{t("gallery.table.desc")}</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("gallery.table.scale")}</TableHead>
              <TableHead>{t("gallery.table.status")}</TableHead>
              <TableHead className="text-right">
                {t("gallery.table.steps")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {TABLE_ROWS.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{rowLabels[row.id]}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[row.status]}>
                    {statusLabels[row.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {row.value}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function OverlaysCard() {
  const { t } = useTranslate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("gallery.overlays.title")}</CardTitle>
        <CardDescription>{t("gallery.overlays.desc")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger render={<Button size="sm" variant="outline" />}>
                {t("gallery.overlays.tooltip")}
              </TooltipTrigger>
              <TooltipContent>
                {t("gallery.overlays.tooltip-hint")}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Popover>
            <PopoverTrigger render={<Button size="sm" variant="outline" />}>
              {t("gallery.overlays.popover")}
            </PopoverTrigger>
            <PopoverContent className="max-w-64">
              <PopoverTitle>{t("gallery.overlays.popover-title")}</PopoverTitle>
              <PopoverDescription>
                {t("gallery.overlays.popover-desc")}
              </PopoverDescription>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button size="sm" variant="outline" />}
            >
              {t("gallery.overlays.menu")}
              <ChevronDownIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>
                {t("gallery.overlays.menu-rename")}
              </DropdownMenuItem>
              <DropdownMenuItem>
                {t("gallery.overlays.menu-duplicate")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                {t("gallery.overlays.menu-delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="icon" variant="ghost">
            <MoreHorizontalIcon />
          </Button>
        </div>

        <Separator />

        <div className="flex flex-col gap-3">
          <Label htmlFor="overlay-chroma">
            {t("gallery.overlays.strength")}
          </Label>
          <Slider defaultValue={70} id="overlay-chroma" max={100} min={0} />
        </div>

        <RadioGroup defaultValue="oklch">
          <div className="flex items-center gap-2">
            <RadioGroupItem id="space-oklch" value="oklch" />
            <Label className="font-normal" htmlFor="space-oklch">
              OKLCH
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem id="space-hsl" value="hsl" />
            <Label className="font-normal" htmlFor="space-hsl">
              HSL
            </Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}

function LoadingCard() {
  const { t } = useTranslate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("gallery.loading.title")}</CardTitle>
        <CardDescription>{t("gallery.loading.desc")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
        <Skeleton className="h-24 w-full" />
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span>{t("gallery.loading.uploading")}</span>
            <span className="font-mono tabular-nums">{UPLOAD_PERCENT}%</span>
          </div>
          <Progress value={UPLOAD_PERCENT} />
        </div>
      </CardContent>
    </Card>
  );
}

function NavigationCard() {
  const { t } = useTranslate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("gallery.nav.title")}</CardTitle>
        <CardDescription>{t("gallery.nav.desc")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#home">
                {t("gallery.nav.home")}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#palettes">
                {t("gallery.nav.palettes")}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t("gallery.nav.current")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Separator />

        <div className="flex flex-wrap gap-2">
          <Button size="sm">{t("gallery.nav.primary")}</Button>
          <Button size="sm" variant="secondary">
            {t("gallery.nav.secondary")}
          </Button>
          <Button size="sm" variant="outline">
            {t("gallery.nav.outline")}
          </Button>
          <Button size="sm" variant="ghost">
            {t("gallery.nav.ghost")}
          </Button>
          <Button disabled size="sm">
            {t("gallery.nav.disabled")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ComponentsView() {
  return (
    <>
      <CalendarCard />
      <ChecklistCard />
      <FormStatesCard />
      <CategoryListCard />
      <AlertsCard />
      <TeamCard />
      <TableCard />
      <OverlaysCard />
      <LoadingCard />
      <NavigationCard />
    </>
  );
}
