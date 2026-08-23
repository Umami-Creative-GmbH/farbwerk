/**
 * "From image" — lift a palette off a logo or a photo.
 *
 * The flow is deliberately two-handed: the extraction proposes candidates, the
 * user assigns them. Pick the role you are filling, then click a swatch. Only
 * primary has to be filled — an image with one strong brand color is the common
 * case, and secondary and tertiary follow when the image actually carries them.
 *
 * Everything runs on a canvas in this tab. The file never leaves the browser,
 * which is what the line under the drop zone promises.
 */
import { useTranslate } from "@tolgee/react";
import { ImageIcon } from "lucide-react";
import { useCallback, useReducer, useRef, useState } from "react";
import { toast } from "sonner";
import { usePalette } from "@/components/palette/palette-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRoleLabels } from "@/i18n/labels";
import { extractFromImage, type ImagePalette } from "@/lib/color/image";
import type { ScaleRole } from "@/lib/color/types";
import { type ExtractedPicks, SCALE_ROLES } from "@/lib/palette/state";
import { cn } from "@/lib/utils";
import { PILL, SECTION_LABEL } from "./chrome-styles";

type Picks = Record<ScaleRole, string | null>;

const NO_PICKS: Picks = { primary: null, secondary: null, tertiary: null };

/**
 * Everything the extraction flow proposes, as one value.
 *
 * These five move together, not separately: reading an image sets all of them,
 * and closing the dialog puts all of them back. Held as five `useState`s that
 * was five setter calls in each of those two places, and a reset that silently
 * rots the moment someone adds a sixth field. One reducer makes each transition
 * a single named action instead. `open` stays its own state — the dialog's
 * visibility is genuinely independent of what the extraction found.
 */
interface ExtractState {
  /** Set once an image has been read, so "nothing usable" only shows after one. */
  analyzed: boolean;
  candidates: string[];
  picks: Picks;
  preview: string | null;
  slot: ScaleRole;
}

const NOTHING_EXTRACTED: ExtractState = {
  analyzed: false,
  candidates: [],
  picks: NO_PICKS,
  preview: null,
  slot: "primary",
};

type ExtractAction =
  | { colors: string[]; thumbnail: string | null; type: "analyzed" }
  | { hex: string; type: "assign" }
  | { role: ScaleRole; type: "clear" }
  | { role: ScaleRole; type: "select" }
  | { type: "reset" };

function extractReducer(
  state: ExtractState,
  action: ExtractAction
): ExtractState {
  switch (action.type) {
    case "analyzed":
      return {
        analyzed: true,
        candidates: action.colors,
        // The first two colors are proposed straight away; tertiary stays open.
        picks: {
          primary: action.colors[0] ?? null,
          secondary: action.colors[1] ?? null,
          tertiary: null,
        },
        preview: action.thumbnail,
        slot: "primary",
      };
    case "assign":
      return {
        ...state,
        picks: { ...state.picks, [state.slot]: action.hex },
      };
    case "clear":
      return { ...state, picks: { ...state.picks, [action.role]: null } };
    case "select":
      return { ...state, slot: action.role };
    case "reset":
      return NOTHING_EXTRACTED;
    default:
      return state;
  }
}

/** Intrinsic size given to the preview thumbnail, so it reserves its own box. */
const PREVIEW_EDGE = 96;

/** The ring a swatch or a slot wears while it is the selected one. */
const SELECTED_RING =
  "0 0 0 3px var(--surface-card), 0 0 0 5px var(--fw-active-bg)";

export function ExtractDialog() {
  const { t } = useTranslate();
  const { dispatch } = usePalette();
  const roleLabels = useRoleLabels();

  const [open, setOpen] = useState(false);
  // `send`, not `dispatch` — the palette's own dispatch is already in scope.
  const [extract, send] = useReducer(extractReducer, NOTHING_EXTRACTED);
  const { analyzed, candidates, picks, preview, slot } = extract;

  const readFile = useCallback(async (file: File | null | undefined) => {
    if (!file?.type.startsWith("image/")) {
      return;
    }
    // The object URL exists only long enough to decode. What the preview keeps
    // is the sampled thumbnail, which needs no cleanup at all.
    const url = URL.createObjectURL(file);
    let result: ImagePalette = { colors: [], thumbnail: null };
    try {
      result = await extractFromImage(url);
    } catch {
      result = { colors: [], thumbnail: null };
    } finally {
      URL.revokeObjectURL(url);
    }

    send({
      colors: result.colors,
      thumbnail: result.thumbnail,
      type: "analyzed",
    });
  }, []);

  const handleInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      readFile(event.target.files?.[0]);
      // Let the same file be picked twice — after a Cancel, it is a fresh start.
      event.target.value = "";
    },
    [readFile]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      readFile(event.dataTransfer.files?.[0]);
    },
    [readFile]
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
  }, []);

  const handleAssign = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const { hex } = event.currentTarget.dataset;
      if (hex) {
        // The reducer reads the live `slot`, so this no longer re-creates
        // itself (and re-renders every swatch) each time the slot changes.
        send({ hex, type: "assign" });
      }
    },
    []
  );

  const handleSlot = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      send({
        role: event.currentTarget.dataset.role as ScaleRole,
        type: "select",
      });
    },
    []
  );

  const handleClear = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const role = event.currentTarget.dataset.role as ScaleRole;
      send({ role, type: "clear" });
    },
    []
  );

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (next) {
      return;
    }
    // One action clears the whole proposal — no field can be forgotten here.
    send({ type: "reset" });
  }, []);

  const handleCancel = useCallback(() => {
    handleOpenChange(false);
  }, [handleOpenChange]);

  const handleApply = useCallback(() => {
    if (!picks.primary) {
      return;
    }
    const applied: ExtractedPicks = {
      primary: picks.primary,
      secondary: picks.secondary,
      tertiary: picks.tertiary,
    };
    dispatch({ picks: applied, type: "applyExtracted" });
    toast.success(t("toast.extract-applied"));
    handleOpenChange(false);
  }, [dispatch, handleOpenChange, picks, t]);

  /**
   * Built once per render rather than per swatch: the assigned-ring check below
   * runs for every candidate, and `Object.values` would allocate a fresh array
   * each time. React Compiler skips this component (the `finally` in `readFile`
   * is not yet supported), so nothing memoises this for us.
   */
  const assigned = new Set(Object.values(picks).filter(Boolean));

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger className="mt-3 flex h-10.5 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-(--border-strong) bg-(--surface-card) font-heading text-(--text-heading) text-[11px] uppercase tracking-[0.12em] transition-[color,background-color,border-color] duration-150 ease-out hover:border-(--fw-active-bg) hover:bg-(--fw-active-bg) hover:text-(--fw-active-fg)">
        <ImageIcon className="size-3.5" />
        {t("extract.open")}
      </DialogTrigger>

      {/* sm:max-w-[720px], not max-w-: DialogContent ships an sm:max-w-sm that
          would otherwise win inside the breakpoint. */}
      <DialogContent className="gap-0 rounded-dialog p-0 sm:max-w-180">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="font-heading text-(--text-heading) text-[20px] tracking-[-0.02em]">
            {t("extract.title")}
          </DialogTitle>
          <DialogDescription className="text-(--text-muted) text-[12.5px]">
            {t("extract.file-hint")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 p-6">
          <DropZone
            label={t("extract.drop")}
            onChange={handleInput}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            preview={preview}
          />

          {candidates.length > 0 ? (
            <div className="grid gap-4.5">
              <div className="grid gap-2.5">
                <span className={SECTION_LABEL}>{t("extract.extracted")}</span>
                <div className="flex flex-wrap gap-2.5">
                  {candidates.map((hex) => (
                    <button
                      aria-label={hex.toUpperCase()}
                      className="size-14 cursor-pointer rounded-[14px] border border-[rgba(18,33,67,.14)] transition-transform duration-150 ease-out hover:-translate-y-0.5"
                      data-hex={hex}
                      key={hex}
                      onClick={handleAssign}
                      style={{
                        background: hex,
                        boxShadow: assigned.has(hex)
                          ? SELECTED_RING
                          : undefined,
                      }}
                      title={hex.toUpperCase()}
                      type="button"
                    />
                  ))}
                </div>
                <span className="text-(--text-muted) text-[12.5px]">
                  {t("extract.hint")}
                </span>
              </div>

              <div className="grid gap-2">
                {SCALE_ROLES.map((role) => (
                  <SlotRow
                    hex={picks[role]}
                    key={role}
                    label={roleLabels[role]}
                    note={
                      role === "primary"
                        ? t("extract.required")
                        : t("extract.optional")
                    }
                    offLabel={t("extract.off")}
                    onClear={handleClear}
                    onSelect={handleSlot}
                    removeLabel={t("extract.cancel")}
                    role={role}
                    selected={slot === role}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {analyzed && candidates.length === 0 ? (
            <p className="text-(--text-muted) text-[13px]">
              {t("extract.none")}
            </p>
          ) : null}

          <div className="flex justify-end gap-2.5 border-(--border-subtle) border-t pt-4.5">
            <button
              className="h-10.5 cursor-pointer rounded-full border border-(--border-strong) bg-(--surface-card) px-4.5 font-heading text-(--text-heading) text-[12px] uppercase tracking-[0.12em]"
              onClick={handleCancel}
              type="button"
            >
              {t("extract.cancel")}
            </button>
            <button
              className="h-10.5 cursor-pointer rounded-full border-none bg-(--pink-500) px-5 font-heading text-[12px] text-white uppercase tracking-[0.12em] shadow-(--shadow-accent) transition-colors duration-150 ease-out hover:bg-(--pink-700)"
              disabled={!picks.primary}
              onClick={handleApply}
              type="button"
            >
              {t("extract.apply")}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface DropZoneProps {
  label: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLElement>) => void;
  onDrop: (event: React.DragEvent<HTMLElement>) => void;
  preview: string | null;
}

/**
 * The file picker, wearing a thumbnail.
 *
 * A button rather than a `<label>`: the zone also accepts a drop, and a drop
 * target has to be something the keyboard can reach and the screen reader can
 * announce. The input behind it stays hidden so there is exactly one tab stop.
 */
function DropZone({
  preview,
  label,
  onChange,
  onDrop,
  onDragOver,
}: DropZoneProps) {
  const input = useRef<HTMLInputElement>(null);

  const openPicker = useCallback(() => {
    input.current?.click();
  }, []);

  return (
    <>
      <button
        className="grid cursor-pointer grid-cols-[96px_minmax(0,1fr)] items-center gap-4.5 rounded-card border border-(--border-strong) border-dashed bg-(--surface-muted) p-4 text-left transition-colors duration-150 ease-out hover:border-(--fw-active-bg)"
        onClick={openPicker}
        onDragOver={onDragOver}
        onDrop={onDrop}
        type="button"
      >
        <span className="flex size-24 items-center justify-center overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--surface-card)">
          {preview ? (
            <img
              alt=""
              className="size-full object-contain"
              height={PREVIEW_EDGE}
              src={preview}
              width={PREVIEW_EDGE}
            />
          ) : (
            <ImageIcon
              aria-hidden="true"
              className="size-6 text-(--slate-400)"
            />
          )}
        </span>
        <span className="min-w-0 font-heading text-(--text-heading) text-[14px]">
          {label}
        </span>
      </button>
      <input
        accept="image/*"
        className="hidden"
        onChange={onChange}
        ref={input}
        type="file"
      />
    </>
  );
}

interface SlotRowProps {
  hex: string | null;
  label: string;
  note: string;
  offLabel: string;
  onClear: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onSelect: (event: React.MouseEvent<HTMLButtonElement>) => void;
  removeLabel: string;
  role: ScaleRole;
  selected: boolean;
}

/** One assignable role: its swatch, what it is for, and what it currently holds. */
function SlotRow({
  role,
  label,
  note,
  hex,
  offLabel,
  selected,
  onSelect,
  onClear,
  removeLabel,
}: SlotRowProps) {
  const value = hex ? hex.toUpperCase() : offLabel;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
      <button
        aria-pressed={selected}
        className={cn(
          "grid cursor-pointer grid-cols-[26px_minmax(0,1fr)_auto] items-center gap-3 rounded-[14px] border px-3.5 py-2.5 text-left transition-[color,background-color,border-color] duration-150 ease-out",
          selected
            ? "border-(--fw-active-bg) bg-(--surface-muted)"
            : "border-(--border-subtle) bg-(--surface-card) hover:border-(--border-strong)"
        )}
        data-role={role}
        onClick={onSelect}
        type="button"
      >
        <span
          className={cn(
            "block size-6.5 rounded-lg border",
            hex ? "border-[rgba(18,33,67,.14)]" : "border-(--border-strong)"
          )}
          style={{ background: hex ?? "transparent" }}
        />
        <span className="grid min-w-0 gap-0.5">
          <span className="font-heading text-(--text-heading) text-[13px]">
            {label}
          </span>
          <span className="font-heading text-(--text-muted) text-[10px] uppercase tracking-[0.12em]">
            {note}
          </span>
        </span>
        <span className="font-mono text-(--text-muted) text-[12.5px]">
          {value}
        </span>
      </button>

      {role === "primary" || !hex ? null : (
        <button
          aria-label={`${removeLabel} — ${label}`}
          className={cn(
            PILL,
            "flex size-6.5 items-center justify-center border-(--border-subtle) bg-(--surface-card) text-(--slate-500) hover:border-(--pink-500) hover:text-(--pink-500)"
          )}
          data-role={role}
          onClick={onClear}
          type="button"
        >
          ×
        </button>
      )}
    </div>
  );
}
