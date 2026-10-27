/**
 * The harmony generator, shown while primary is the selected scale.
 *
 * One click turns a single base into three related scales: the rule is applied
 * to secondary and tertiary at once, creating them if they do not exist yet.
 * Each option draws its own hue wheel, so you can see the shape a rule makes
 * before choosing it — three dots spread around the ring, or for `mono` three
 * concentric dots on one spoke, because that rule desaturates instead of
 * rotating.
 */
import { useTranslate } from "@tolgee/react";
import { ChevronDownIcon } from "lucide-react";
import { useCallback, useState } from "react";

import { usePalette } from "@/components/palette/palette-context";
import { useHarmonyCopy } from "@/i18n/labels";
import { hexToOklch } from "@/lib/color/convert";
import {
  HARMONY_RULES,
  harmonyAngles,
  harmonyPreview,
} from "@/lib/color/harmony";
import type { HarmonyRule } from "@/lib/color/harmony";
import { cn } from "@/lib/utils";

const WHEEL_SIZE = 30;
const WHEEL_CENTER = WHEEL_SIZE / 2;
const DOT_SIZE = 8;
const DEGREES_TO_RADIANS = Math.PI / 180;
const QUARTER_TURN = 90;

/** Full ring for rules that rotate; concentric for the one that does not. */
const SPREAD_RADII = [9.5, 9.5, 9.5];
const MONO_RADII = [9.5, 4.5, 0];

interface Dot {
  color: string;
  left: number;
  top: number;
}

function wheelDots(rule: HarmonyRule, primaryBase: string): Dot[] {
  const baseHue = hexToOklch(primaryBase).h;
  const angles = harmonyAngles(rule);
  const preview = harmonyPreview(primaryBase, rule);
  const colors = [preview.primary, preview.secondary, preview.tertiary];
  const radii = rule === "mono" ? MONO_RADII : SPREAD_RADII;

  return angles.map((angle, index) => {
    const radians = (baseHue + angle - QUARTER_TURN) * DEGREES_TO_RADIANS;
    return {
      color: colors[index],
      left: WHEEL_CENTER + Math.cos(radians) * radii[index],
      top: WHEEL_CENTER + Math.sin(radians) * radii[index],
    };
  });
}

export function HarmonyGenerator() {
  const { t } = useTranslate();
  const { state, dispatch } = usePalette();
  const harmonyCopy = useHarmonyCopy();
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => {
    setOpen((previous) => !previous);
  }, []);

  const apply = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const { rule } = event.currentTarget.dataset;
      if (rule) {
        dispatch({ rule: rule as HarmonyRule, type: "generate" });
        setOpen(false);
      }
    },
    [dispatch]
  );

  if (state.active !== "primary") {
    return null;
  }

  const primaryBase = state.roles.primary.base;

  return (
    <div>
      <button
        aria-expanded={open}
        className="font-heading flex h-10.5 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-(--border-strong) bg-(--surface-card) text-[11px] tracking-[0.12em] text-(--text-heading) uppercase transition-[color,background-color,border-color] duration-150 ease-out hover:border-(--fw-active-bg) hover:bg-(--fw-active-bg) hover:text-(--fw-active-fg)"
        onClick={toggle}
        type="button"
      >
        {t("harmony.generate")}
        <ChevronDownIcon
          className={cn(
            "size-3.5 transition-transform duration-150 ease-out",
            open && "rotate-180"
          )}
        />
      </button>

      {open ? (
        <div className="mt-2.5 grid gap-0.5 rounded-[14px] border border-(--border-subtle) p-2 shadow-[0_8px_24px_rgba(18,33,67,.10)]">
          {HARMONY_RULES.map((rule) => (
            <button
              className="grid cursor-pointer grid-cols-[30px_minmax(0,1fr)] items-center gap-3 rounded-[10px] px-2.5 py-2 text-left transition-colors duration-150 ease-out hover:bg-(--surface-muted)"
              data-rule={rule}
              key={rule}
              onClick={apply}
              type="button"
            >
              <span
                aria-hidden="true"
                className="relative block size-7.5 rounded-full border border-(--border-subtle) bg-(--surface-card)"
              >
                {wheelDots(rule, primaryBase).map((dot) => (
                  <span
                    className="absolute rounded-full"
                    key={`${dot.left}-${dot.top}-${dot.color}`}
                    style={{
                      background: dot.color,
                      height: DOT_SIZE,
                      left: dot.left,
                      margin: `-${DOT_SIZE / 2}px 0 0 -${DOT_SIZE / 2}px`,
                      top: dot.top,
                      width: DOT_SIZE,
                    }}
                  />
                ))}
              </span>
              <span className="grid min-w-0 gap-0.5">
                <span className="font-heading text-[12.5px] text-(--text-heading)">
                  {harmonyCopy[rule].name}
                </span>
                <span className="text-[11.5px] leading-[1.35] text-(--text-muted)">
                  {harmonyCopy[rule].hint}
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
