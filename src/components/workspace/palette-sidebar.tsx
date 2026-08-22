/**
 * The sidebar from SPEC §4.
 *
 * A full-height sticky panel: a white card against the page's slate tint, with
 * its own scroll and a hairline down its right edge. Everything here shapes the
 * selected scale — the actions live in the toolbar, next to the strip they act
 * on.
 *
 * Anchor steps and harmony rules are pill rows rather than dropdowns: there are
 * only ever twelve and eight of them, and seeing the whole set at once is the
 * point.
 */
import { useTranslate } from "@tolgee/react";
import { useCallback } from "react";
import { usePalette } from "@/components/palette/palette-context";
import { useRoleNames } from "@/hooks/use-role-names";
import { useRoleLabels } from "@/i18n/labels";
import {
  type AnchorSetting,
  CHROMA_RANGE,
  HUE_SHIFT_RANGE,
  SPREAD_RANGE,
} from "@/lib/color/scale";
import { SCALE_KEYS, type ScaleKey } from "@/lib/color/types";
import type { RampControl } from "@/lib/palette/state";
import { cn } from "@/lib/utils";
import {
  FIELD_INPUT,
  PILL,
  PILL_ACTIVE,
  PILL_IDLE,
  SECTION_LABEL,
} from "./chrome-styles";
import { ColorPickerField } from "./color-picker-field";
import { HarmonyGenerator } from "./harmony-generator";
import { HarmonyPicker } from "./harmony-picker";
import { RoleList } from "./role-list";
import { SavedPalettes } from "./saved-palettes";

/** The four brand accents, the navy, and a few useful neighbours. */
const PRESETS = [
  "#0078d2",
  "#e60096",
  "#00d4a8",
  "#ff8900",
  "#122143",
  "#6e7a94",
  "#7c3aed",
  "#dc2626",
] as const;

type SliderKey = "chroma" | "hue-shift" | "spread";

const SLIDERS: {
  control: RampControl;
  key: SliderKey;
  range: { min: number; max: number; step: number };
}[] = [
  { control: "chroma", key: "chroma", range: CHROMA_RANGE },
  { control: "hueShift", key: "hue-shift", range: HUE_SHIFT_RANGE },
  { control: "spread", key: "spread", range: SPREAD_RANGE },
];

/** Spelled out, not composed, so `tolgee extract` can see the keys. */
function useSliderCopy(): Record<SliderKey, { hint: string; label: string }> {
  const { t } = useTranslate();

  return {
    chroma: { hint: t("sidebar.chroma-hint"), label: t("sidebar.chroma") },
    "hue-shift": {
      hint: t("sidebar.hue-shift-hint"),
      label: t("sidebar.hue-shift"),
    },
    spread: { hint: t("sidebar.spread-hint"), label: t("sidebar.spread") },
  };
}

const HUE_DIGITS = 0;
const RATIO_DIGITS = 2;

export function PaletteSidebar() {
  const { t } = useTranslate();
  const { state, dispatch, fieldsFor, anchorStep, detectedStep } = usePalette();
  const active = fieldsFor(state.active);
  const roleNames = useRoleNames();
  const roleLabels = useRoleLabels();

  const handleName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      dispatch({ name: event.target.value, type: "setName" });
    },
    [dispatch]
  );

  const handleBase = useCallback(
    (hex: string) => {
      dispatch({ base: hex, type: "setBase" });
    },
    [dispatch]
  );

  const handlePreset = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const { hex } = event.currentTarget.dataset;
      if (hex) {
        dispatch({ base: hex, type: "setBase" });
      }
    },
    [dispatch]
  );

  const handleAnchor = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const { anchor } = event.currentTarget.dataset;
      const next: AnchorSetting =
        anchor === "auto" ? "auto" : (Number(anchor) as ScaleKey);
      dispatch({ anchor: next, type: "setAnchor" });
    },
    [dispatch]
  );

  const handleSlider = useCallback(
    (control: RampControl, value: number) => {
      dispatch({ control, type: "setControl", value });
    },
    [dispatch]
  );

  const handleResetEdits = useCallback(() => {
    dispatch({ type: "resetOverrides" });
  }, [dispatch]);

  if (!active) {
    return null;
  }

  const resolvedName = roleNames[state.active];
  const editedCount = Object.keys(active.overrides).length;
  const isAuto = active.anchor === "auto";
  const anchorLabel = isAuto
    ? t("sidebar.anchor-detected")
    : t("sidebar.anchor-pinned");

  return (
    <aside className="grid content-start gap-6 border-[var(--border-subtle)] bg-[var(--surface-card)] px-6 pt-[26px] pb-8 [scrollbar-gutter:stable] lg:sticky lg:top-[var(--fw-header-height)] lg:h-[calc(100vh-var(--fw-header-height))] lg:overflow-y-auto lg:border-r">
      <RoleList />

      <div>
        <label className={cn(SECTION_LABEL, "mb-2 block")} htmlFor="scale-name">
          {t("sidebar.color-name")}
        </label>
        <input
          className={FIELD_INPUT}
          id="scale-name"
          onChange={handleName}
          placeholder={roleLabels[state.active]}
          type="text"
          value={active.name}
        />
        {/*
          Always mounted, one line tall whether or not it has something to say.
          The name lookup is debounced and asynchronous, so unmounting this
          while it resolves made every control below it jump on each new color.
        */}
        <p className="mt-2 min-h-[1.5em] text-[12.5px] text-[var(--text-muted)] leading-[1.5]">
          {active.name.trim()
            ? null
            : t("sidebar.nearest-name", { name: resolvedName ?? "" })}
        </p>
      </div>

      <div>
        <span className={cn(SECTION_LABEL, "mb-2 block")}>
          {t("sidebar.base-color")}
        </span>
        <ColorPickerField onChange={handleBase} value={active.base} />
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map((hex) => (
            <button
              aria-label={hex}
              className="size-[26px] cursor-pointer rounded-full border border-[rgba(18,33,67,.14)] transition-transform duration-150 ease-[var(--ease-out)] hover:-translate-y-0.5"
              data-hex={hex}
              key={hex}
              onClick={handlePreset}
              style={{ background: hex }}
              type="button"
            />
          ))}
        </div>
      </div>

      <HarmonyGenerator />
      <HarmonyPicker />

      <div>
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <span className={SECTION_LABEL}>{t("sidebar.anchor-step")}</span>
          {/* fw-pink-ink, not pink-500: the accent needs to lift off the dark
              surface as well as sit on the light one. */}
          <span className="font-mono text-[11px] text-[var(--fw-pink-ink)]">
            {anchorLabel} {anchorStep}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            className={cn(
              PILL,
              "h-[30px] min-w-[38px] px-2.5",
              isAuto ? PILL_ACTIVE : PILL_IDLE
            )}
            data-anchor="auto"
            onClick={handleAnchor}
            type="button"
          >
            auto
          </button>
          {SCALE_KEYS.map((key) => (
            <button
              className={cn(
                PILL,
                "h-[30px] min-w-[38px] px-2.5",
                !isAuto && active.anchor === key ? PILL_ACTIVE : PILL_IDLE
              )}
              data-anchor={key}
              key={key}
              onClick={handleAnchor}
              type="button"
            >
              {key}
            </button>
          ))}
        </div>
        <p className="mt-2.5 text-[12.5px] text-[var(--text-muted)] leading-[1.55]">
          {t("sidebar.anchor-auto", { step: detectedStep })}
        </p>
      </div>

      <div className="grid gap-[18px]">
        {SLIDERS.map((slider) => (
          <SliderRow
            key={slider.control}
            onChange={handleSlider}
            slider={slider}
            value={active[slider.control]}
          />
        ))}
      </div>

      <div className="grid gap-3 border-[var(--border-subtle)] border-t pt-5">
        <button
          className="h-11 cursor-pointer rounded-full border border-transparent bg-[var(--surface-muted)] font-heading text-[12px] text-[var(--slate-600)] uppercase tracking-[0.12em] transition-colors duration-150 ease-[var(--ease-out)] hover:text-[var(--navy-800)] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={editedCount === 0}
          onClick={handleResetEdits}
          type="button"
        >
          {t("sidebar.reset-edits")}
          {editedCount > 0 ? ` (${editedCount})` : ""}
        </button>
      </div>

      <SavedPalettes />
    </aside>
  );
}

interface SliderRowProps {
  onChange: (control: RampControl, value: number) => void;
  slider: (typeof SLIDERS)[number];
  value: number;
}

function SliderRow({ slider, value, onChange }: SliderRowProps) {
  const copy = useSliderCopy()[slider.key];

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(slider.control, Number(event.target.value));
    },
    [onChange, slider.control]
  );

  const isHue = slider.control === "hueShift";

  return (
    <div>
      <div className="mb-2 flex justify-between">
        <label className={SECTION_LABEL} htmlFor={`slider-${slider.control}`}>
          {copy.label}
        </label>
        <span className="font-mono text-[11px] text-[var(--text-heading)] tabular-nums">
          {isHue
            ? `${value > 0 ? "+" : ""}${value.toFixed(HUE_DIGITS)}°`
            : value.toFixed(RATIO_DIGITS)}
        </span>
      </div>
      <input
        className="w-full"
        id={`slider-${slider.control}`}
        max={slider.range.max}
        min={slider.range.min}
        onChange={handleChange}
        step={slider.range.step}
        type="range"
        value={value}
      />
      <p className="mt-2 text-[12.5px] text-[var(--text-muted)] leading-[1.55]">
        {copy.hint}
      </p>
    </div>
  );
}
