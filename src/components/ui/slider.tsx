import { Slider as SliderPrimitive } from "@base-ui/react/slider";

import { cn } from "@/lib/utils";

function resolveThumbValues({
  value,
  defaultValue,
  min,
  max,
}: {
  value: SliderPrimitive.Root.Props["value"];
  defaultValue: SliderPrimitive.Root.Props["defaultValue"];
  min: number;
  max: number;
}): readonly number[] {
  if (Array.isArray(value)) {
    return value;
  }
  if (Array.isArray(defaultValue)) {
    return defaultValue;
  }
  return [min, max];
}

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: SliderPrimitive.Root.Props) {
  const _values = resolveThumbValues({ defaultValue, max, min, value });

  return (
    <SliderPrimitive.Root
      className={cn("data-vertical:h-full data-horizontal:w-full", className)}
      data-slot="slider"
      defaultValue={defaultValue}
      max={max}
      min={min}
      thumbAlignment="edge"
      value={value}
      {...props}
    >
      <SliderPrimitive.Control className="relative flex w-full touch-none select-none items-center data-vertical:h-full data-vertical:min-h-40 data-vertical:flex-col data-disabled:opacity-50">
        <SliderPrimitive.Track
          className="relative grow select-none overflow-hidden rounded-full bg-muted data-horizontal:h-1 data-horizontal:w-full"
          data-slot="slider-track"
        >
          <SliderPrimitive.Indicator
            className="select-none bg-primary data-horizontal:h-full data-vertical:w-full"
            data-slot="slider-range"
          />
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            className="relative block size-3 shrink-0 select-none rounded-full border border-ring bg-white ring-ring/50 transition-[color,box-shadow] after:absolute after:-inset-2 hover:ring-3 focus-visible:outline-hidden focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50"
            data-slot="slider-thumb"
            // biome-ignore lint/suspicious/noArrayIndexKey: a range thumb has no identity beyond its ordinal position, and the list is never reordered — only grown or shrunk from the end.
            key={index}
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };
