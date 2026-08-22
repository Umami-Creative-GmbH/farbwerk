/**
 * Saved palettes.
 *
 * Persisted to localStorage, so they survive a reload — and reopening one
 * restores the whole control state, not just the rendered hexes. Each row shows
 * its name against a slice of its own ramp, which is how you recognise a
 * palette faster than by reading its name.
 */
import { useTranslate } from "@tolgee/react";
import { PencilIcon, TrashIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { usePalette } from "@/components/palette/palette-context";
import { useSavedPalettes } from "@/hooks/use-saved-palettes";
import type { ScaleKey } from "@/lib/color/types";
import { paletteScales } from "@/lib/palette/state";
import { cn } from "@/lib/utils";
import { FIELD_INPUT, SECTION_LABEL } from "./chrome-styles";

/** The steps the little preview bar shows. */
const PREVIEW_STEPS: ScaleKey[] = [100, 300, 500, 700, 900];

const ROW_ACTION =
  "flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full border border-transparent text-[var(--text-muted)] opacity-0 transition-colors duration-150 ease-[var(--ease-out)] focus-visible:opacity-100 group-hover:opacity-100";

export function SavedPalettes() {
  const { t } = useTranslate();
  const { dispatch } = usePalette();
  const { palettes, rename, remove } = useSavedPalettes();
  const [editing, setEditing] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  const handleOpen = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const { id } = event.currentTarget.dataset;
      const entry = palettes.find((item) => item.id === id);
      if (entry) {
        dispatch({ state: entry.state, type: "loadState" });
        toast.success(t("toast.opened", { name: entry.name }));
      }
    },
    [palettes, dispatch, t]
  );

  const handleDelete = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const { id } = event.currentTarget.dataset;
      if (id) {
        remove(id);
      }
    },
    [remove]
  );

  const startRename = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const { id, name } = event.currentTarget.dataset;
      setEditing(id ?? null);
      setDraftName(name ?? "");
    },
    []
  );

  const commitRename = useCallback(() => {
    if (editing) {
      rename(editing, draftName);
    }
    setEditing(null);
  }, [editing, draftName, rename]);

  const handleDraft = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setDraftName(event.target.value);
    },
    []
  );

  const handleDraftKey = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        commitRename();
      }
      if (event.key === "Escape") {
        setEditing(null);
      }
    },
    [commitRename]
  );

  return (
    <div>
      <span className={cn(SECTION_LABEL, "mb-3 block")}>
        {t("sidebar.saved")}
      </span>

      {palettes.length === 0 ? (
        <p className="text-[13px] text-[var(--text-muted)]">
          {t("sidebar.saved-empty")}
        </p>
      ) : (
        <div className="grid gap-2">
          {palettes.map((entry) => {
            const scales = paletteScales(entry.state);
            if (editing === entry.id) {
              return (
                <input
                  aria-label={t("sidebar.palette-name")}
                  className={cn(FIELD_INPUT, "h-9 text-[12px]")}
                  key={entry.id}
                  onBlur={commitRename}
                  onChange={handleDraft}
                  onKeyDown={handleDraftKey}
                  type="text"
                  value={draftName}
                />
              );
            }
            return (
              <div
                className="group grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-2 transition-colors duration-150 ease-[var(--ease-out)] hover:border-[var(--border-strong)]"
                key={entry.id}
              >
                <button
                  className="grid min-w-0 cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-2 text-left"
                  data-id={entry.id}
                  onClick={handleOpen}
                  type="button"
                >
                  <span className="truncate font-mono text-[12px] text-[var(--text-heading)]">
                    {entry.name}
                  </span>
                  <span className="flex overflow-hidden rounded-full">
                    {PREVIEW_STEPS.map((step) => (
                      <span
                        className="size-3"
                        key={step}
                        style={{ background: scales.primary[step] }}
                      />
                    ))}
                  </span>
                </button>
                <button
                  aria-label={t("sidebar.rename")}
                  className={cn(ROW_ACTION, "hover:text-[var(--blue-500)]")}
                  data-id={entry.id}
                  data-name={entry.name}
                  onClick={startRename}
                  type="button"
                >
                  <PencilIcon className="size-3.5" />
                </button>
                <button
                  aria-label={t("sidebar.delete")}
                  className={cn(ROW_ACTION, "hover:text-[var(--pink-500)]")}
                  data-id={entry.id}
                  onClick={handleDelete}
                  type="button"
                >
                  <TrashIcon className="size-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
