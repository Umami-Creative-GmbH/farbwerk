/**
 * Color pickers.
 *
 * The native `<input type="color">` hands the job to the OS dialog, which looks
 * nothing like the rest of the app and cannot be styled. `@uiw/react-color`
 * keeps it inline and on-brand — a saturation square over a hue slider, in a
 * popover anchored to the swatch it edits.
 */
import { useTranslate } from "@tolgee/react";
import { Colorful } from "@uiw/react-color";
import { useCallback } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { normalizeHex } from "@/lib/color/convert";
import { cn } from "@/lib/utils";
import { FIELD_INPUT } from "./chrome-styles";

const PICKER_WIDTH = 232;

export interface ColorSwatchPickerProps {
  className?: string;
  /** Accessible name for the swatch button. */
  label: string;
  onChange: (hex: string) => void;
  /** Current value as `#rrggbb`. */
  value: string;
}

/** A swatch button that opens the picker. */
export function ColorSwatchPicker({
  value,
  onChange,
  label,
  className,
}: ColorSwatchPickerProps) {
  const handlePicker = useCallback(
    (color: { hex: string }) => {
      const hex = normalizeHex(color.hex);
      if (hex) {
        onChange(hex);
      }
    },
    [onChange]
  );

  return (
    <Popover>
      <PopoverTrigger
        aria-label={label}
        className={cn(
          "shrink-0 cursor-pointer border border-[var(--border-strong)] transition-transform duration-150 ease-[var(--ease-out)] hover:-translate-y-0.5",
          className
        )}
        style={{ background: value }}
      />
      <PopoverContent align="start" className="w-auto p-3">
        <Colorful
          color={value}
          disableAlpha
          onChange={handlePicker}
          style={{ width: PICKER_WIDTH }}
        />
      </PopoverContent>
    </Popover>
  );
}

export interface ColorPickerFieldProps {
  onChange: (hex: string) => void;
  value: string;
}

/** The base color row: swatch picker plus the hex you can type into. */
export function ColorPickerField({ value, onChange }: ColorPickerFieldProps) {
  const { t } = useTranslate();

  const handleText = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const hex = normalizeHex(event.target.value);
      if (hex) {
        onChange(hex);
      }
    },
    [onChange]
  );

  return (
    <div className="flex items-center gap-2.5">
      {/* Radius matches FIELD_INPUT beside it, so the pair reads as one control. */}
      <ColorSwatchPicker
        className="h-11 w-[52px] rounded-[8px]"
        label={t("sidebar.pick-base")}
        onChange={onChange}
        value={value}
      />
      <input
        aria-label={t("sidebar.base-color")}
        className={cn(FIELD_INPUT, "uppercase")}
        onChange={handleText}
        type="text"
        value={value}
      />
    </div>
  );
}
