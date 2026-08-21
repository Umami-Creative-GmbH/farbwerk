/**
 * The "Components" sub-view: four cards built from the project's own shadcn
 * primitives. Nothing here sets a color of its own — every surface, accent and
 * ring comes from the theme tokens the gallery wrapper remaps onto the palette.
 */
import { CheckIcon } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const RELEASE_TASKS = [
  { done: true, id: "contrast", label: "Check contrast pairs" },
  { done: true, id: "anchor", label: "Pin 500 as the base" },
  { done: false, id: "tokens", label: "Export tokens to the repo" },
  { done: false, id: "surfaces", label: "Review dark surfaces" },
] as const;

const CATEGORIES = [
  { count: 128, id: "food", label: "Food", step: "--p-500" },
  { count: 74, id: "home", label: "Home", step: "--s-500" },
  { count: 41, id: "travel", label: "Travel", step: "--t-500" },
  { count: 12, id: "studio", label: "Studio", step: "--p-300" },
] as const;

const DONE_COUNT = RELEASE_TASKS.filter((task) => task.done).length;
const DONE_PERCENT = Math.round((DONE_COUNT / RELEASE_TASKS.length) * 100);

function CalendarCard() {
  const [date, setDate] = useState<Date | undefined>(undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Release date</CardTitle>
        <CardDescription>Pick the day the palette ships.</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Calendar
          className="rounded-md border"
          mode="single"
          onSelect={setDate}
          selected={date}
        />
      </CardContent>
    </Card>
  );
}

function ChecklistCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Release checklist</CardTitle>
        <CardDescription>
          {DONE_COUNT} of {RELEASE_TASKS.length} done
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
                {task.label}
              </Label>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full" size="sm">
          <CheckIcon />
          Mark release ready
        </Button>
      </CardFooter>
    </Card>
  );
}

function FormStatesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Form states</CardTitle>
        <CardDescription>Default, error and disabled.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="palette-name">Palette name</Label>
          <Input defaultValue="Azure" id="palette-name" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="palette-base">Base color</Label>
          <Input aria-invalid="true" defaultValue="#00zz12" id="palette-base" />
          <p className="text-destructive text-xs">That is not a hex color.</p>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="palette-note">Note</Label>
          <Textarea
            defaultValue="Locked to the brand blue."
            disabled
            id="palette-note"
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="palette-public">Share publicly</Label>
          <Switch defaultChecked id="palette-public" />
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryListCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories</CardTitle>
        <CardDescription>Swatches straight off the ramps.</CardDescription>
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
              <span className="flex-1 text-sm">{category.label}</span>
              <Badge variant="secondary">{category.count}</Badge>
            </li>
          ))}
        </ul>
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
    </>
  );
}
