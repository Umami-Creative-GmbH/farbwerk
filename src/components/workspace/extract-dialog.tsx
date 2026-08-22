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
import { useCallback, useRef, useState } from "react";
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
  const [preview, setPreview] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<string[]>([]);
  const [picks, setPicks] = useState<Picks>(NO_PICKS);
  const [slot, setSlot] = useState<ScaleRole>("primary");
  /** Set once an image has been read, so "nothing usable" only shows after one. */
  const [analyzed, setAnalyzed] = useState(false);

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

    setPreview(result.thumbnail);
    setCandidates(result.colors);
    setPicks({
      primary: result.colors[0] ?? null,
      secondary: result.colors[1] ?? null,
      tertiary: null,
    });
    setSlot("primary");
    setAnalyzed(true);
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
        setPicks((current) => ({ ...current, [slot]: hex }));
      }
    },
    [slot]
  );

  const handleSlot = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setSlot(event.currentTarget.dataset.role as ScaleRole);
    },
    []
  );

  const handleClear = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const role = event.currentTarget.dataset.role as ScaleRole;
      setPicks((current) => ({ ...current, [role]: null }));
    },
    []
  );

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (next) {
      return;
    }
    setPreview(null);
    setCandidates([]);
    setPicks(NO_PICKS);
    setSlot("primary");
    setAnalyzed(false);
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

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger className="mt-3 flex h-[42px] w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface-card)] font-heading text-[11px] text-[var(--text-heading)] uppercase tracking-[0.12em] transition-[color,background-color,border-color] duration-150 ease-[var(--ease-out)] hover:border-[var(--fw-active-bg)] hover:bg-[var(--fw-active-bg)] hover:text-[var(--fw-active-fg)]">
        <ImageIcon className="size-3.5" />
        {t("extract.open")}
      </DialogTrigger>

      {/* sm:max-w-[720px], not max-w-: DialogContent ships an sm:max-w-sm that
          would otherwise win inside the breakpoint. */}
      <DialogContent className="gap-0 rounded-[var(--radius-dialog)] p-0 sm:max-w-[720px]">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="font-heading text-[20px] text-[var(--text-heading)] tracking-[-0.02em]">
            {t("extract.title")}
          </DialogTitle>
          <DialogDescription className="text-[12.5px] text-[var(--text-muted)]">
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
            <div className="grid gap-[18px]">
              <div className="grid gap-2.5">
                <span className={SECTION_LABEL}>{t("extract.extracted")}</span>
                <div className="flex flex-wrap gap-2.5">
                  {candidates.map((hex) => (
                    <button
                      aria-label={hex.toUpperCase()}
                      className="size-14 cursor-pointer rounded-[14px] border border-[rgba(18,33,67,.14)] transition-transform duration-150 ease-[var(--ease-out)] hover:-translate-y-0.5"
                      data-hex={hex}
                      key={hex}
                      onClick={handleAssign}
                      style={{
                        background: hex,
                        boxShadow: Object.values(picks).includes(hex)
                          ? SELECTED_RING
                          : undefined,
                      }}
                      title={hex.toUpperCase()}
                      type="button"
                    />
                  ))}
                </div>
                <span className="text-[12.5px] text-[var(--text-muted)]">
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
            <p className="text-[13px] text-[var(--text-muted)]">
              {t("extract.none")}
            </p>
          ) : null}

          <div className="flex justify-end gap-2.5 border-[var(--border-subtle)] border-t pt-[18px]">
            <button
              className="h-[42px] cursor-pointer rounded-full border border-[var(--border-strong)] bg-[var(--surface-card)] px-[18px] font-heading text-[12px] text-[var(--text-heading)] uppercase tracking-[0.12em]"
              onClick={handleCancel}
              type="button"
            >
              {t("extract.cancel")}
            </button>
            <button
              className="h-[42px] cursor-pointer rounded-full border-none bg-[var(--pink-500)] px-5 font-heading text-[12px] text-white uppercase tracking-[0.12em] shadow-[var(--shadow-accent)] transition-colors duration-150 ease-[var(--ease-out)] hover:bg-[var(--pink-700)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)] disabled:text-[var(--slate-400)] disabled:shadow-none"
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
        className="grid cursor-pointer grid-cols-[96px_minmax(0,1fr)] items-center gap-[18px] rounded-[20px] border border-[var(--border-strong)] border-dashed bg-[var(--surface-muted)] p-4 text-left transition-colors duration-150 ease-[var(--ease-out)] hover:border-[var(--fw-active-bg)]"
        onClick={openPicker}
        onDragOver={onDragOver}
        onDrop={onDrop}
        type="button"
      >
        <span className="flex size-24 items-center justify-center overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)]">
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
              className="size-6 text-[var(--slate-400)]"
            />
          )}
        </span>
        <span className="min-w-0 font-heading text-[14px] text-[var(--text-heading)]">
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
          "grid cursor-pointer grid-cols-[26px_minmax(0,1fr)_auto] items-center gap-3 rounded-[14px] border px-3.5 py-2.5 text-left transition-[color,background-color,border-color] duration-150 ease-[var(--ease-out)]",
          selected
            ? "border-[var(--fw-active-bg)] bg-[var(--surface-muted)]"
            : "border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-[var(--border-strong)]"
        )}
        data-role={role}
        onClick={onSelect}
        type="button"
      >
        <span
          className={cn(
            "block size-[26px] rounded-lg border",
            hex
              ? "border-[rgba(18,33,67,.14)]"
              : "border-[var(--border-strong)]"
          )}
          style={{ background: hex ?? "transparent" }}
        />
        <span className="grid min-w-0 gap-0.5">
          <span className="font-heading text-[13px] text-[var(--text-heading)]">
            {label}
          </span>
          <span className="font-heading text-[10px] text-[var(--text-muted)] uppercase tracking-[0.12em]">
            {note}
          </span>
        </span>
        <span className="font-mono text-[12.5px] text-[var(--text-muted)]">
          {value}
        </span>
      </button>

      {role === "primary" || !hex ? null : (
        <button
          aria-label={`${removeLabel} — ${label}`}
          className={cn(
            PILL,
            "flex size-[26px] items-center justify-center border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--slate-500)] hover:border-[var(--pink-500)] hover:text-[var(--pink-500)]"
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
