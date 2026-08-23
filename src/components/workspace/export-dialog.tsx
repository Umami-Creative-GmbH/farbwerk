/**
 * The export modal.
 *
 * A label column against two pill rows — format and notation — over a code
 * block on the deepest navy. Every format emits all present roles, named from
 * each role's color name slugified.
 *
 * Closes SPEC gap 6: the prototype could only copy, this can also download the
 * rendered file.
 */

import { useTranslate } from "@tolgee/react";
import { CopyIcon, DownloadIcon, UploadIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { usePalette } from "@/components/palette/palette-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCopy } from "@/hooks/use-copy";
import { useRoleNames } from "@/hooks/use-role-names";
import {
  EXPORT_FILE_META,
  EXPORT_FORMATS,
  EXPORT_NOTATIONS,
  type ExportFormat,
  exportPalette,
} from "@/lib/color/export";
import { slugifyColorName } from "@/lib/color/name";
import type { ColorNotation } from "@/lib/color/types";
import { exportRoles } from "@/lib/palette/state";
import { cn } from "@/lib/utils";
import { ACTION_BUTTON, PILL, PILL_ACTIVE, PILL_IDLE } from "./chrome-styles";

/**
 * Narrower tracking than the sidebar labels — these sit in a tight column.
 * The column is wide enough for English and wraps for the longer locales
 * ("Formato di esportazione") rather than running under the pills.
 */
const ROW_LABEL =
  "pt-[9px] font-heading text-[11px] text-[var(--text-muted)] uppercase leading-tight tracking-[0.14em]";

const LABEL_COLUMN = "104px";

const OPTION_PILL = "px-4 py-2 uppercase tracking-widest";

export function ExportDialog() {
  const { t } = useTranslate();
  const { state } = usePalette();
  const copy = useCopy();
  const [format, setFormat] = useState<ExportFormat>("tw4");
  const [notation, setNotation] = useState<ColorNotation>("hex");

  const roleNames = useRoleNames();
  // Token names come from the resolved name — typed, else the nearest
  // catalogue name — slugified to lowercase-and-dashes by exportPalette.
  const roles = useMemo(
    () => exportRoles(state, roleNames),
    [state, roleNames]
  );
  const code = useMemo(
    () => exportPalette(roles, format, notation),
    [roles, format, notation]
  );

  const handleFormat = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const { value } = event.currentTarget.dataset;
      if (value) {
        setFormat(value as ExportFormat);
      }
    },
    []
  );

  const handleNotation = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const { value } = event.currentTarget.dataset;
      if (value) {
        setNotation(value as ColorNotation);
      }
    },
    []
  );

  const handleCopy = useCallback(() => {
    copy(code, t("toast.export-copied"));
  }, [copy, code, t]);

  const handleDownload = useCallback(() => {
    const { extension, mimeType } = EXPORT_FILE_META[format];
    const name = slugifyColorName(roles[0]?.name ?? "palette") || "palette";
    const url = URL.createObjectURL(new Blob([code], { type: mimeType }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
  }, [code, format, roles]);

  return (
    <Dialog>
      <DialogTrigger className={ACTION_BUTTON}>
        <UploadIcon className="size-3.5" />
        {t("sidebar.export")}
      </DialogTrigger>

      {/* sm:max-w-[860px], not max-w-: DialogContent ships an sm:max-w-sm that
          would otherwise win inside the breakpoint. */}
      <DialogContent className="gap-0 rounded-dialog p-0 sm:max-w-215">
        <DialogHeader className="flex-row items-baseline gap-3 px-6 pt-6">
          <DialogTitle className="font-heading text-(--text-heading) text-[20px] tracking-[-0.02em]">
            {t("export.title")}
          </DialogTitle>
          <DialogDescription className="font-mono text-(--text-muted) text-[12.5px]">
            {t("export.description", { count: roles.length })}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          <div className="mb-4.5 grid gap-3">
            <div
              className="grid items-start gap-3"
              style={{
                gridTemplateColumns: `${LABEL_COLUMN} minmax(0,1fr) auto`,
              }}
            >
              <span className={ROW_LABEL}>{t("export.format")}</span>
              <div className="flex flex-wrap gap-2">
                {EXPORT_FORMATS.map((item) => (
                  <button
                    className={cn(
                      PILL,
                      OPTION_PILL,
                      format === item.value ? PILL_ACTIVE : PILL_IDLE
                    )}
                    data-value={item.value}
                    key={item.value}
                    onClick={handleFormat}
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  className={cn(ACTION_BUTTON, "h-9 px-4 text-[11px]")}
                  onClick={handleDownload}
                  type="button"
                >
                  <DownloadIcon className="size-3.5" />
                  {t("export.download")}
                </button>
                <button
                  className={cn(
                    PILL,
                    PILL_ACTIVE,
                    "flex h-9 items-center gap-2 px-4.5 uppercase tracking-[0.12em]"
                  )}
                  onClick={handleCopy}
                  type="button"
                >
                  <CopyIcon className="size-3.5" />
                  {t("export.copy")}
                </button>
              </div>
            </div>

            <div
              className="grid items-start gap-3 border-(--border-subtle) border-t pt-3"
              style={{ gridTemplateColumns: `${LABEL_COLUMN} minmax(0,1fr)` }}
            >
              <span className={ROW_LABEL}>{t("export.notation")}</span>
              <div className="flex flex-wrap gap-2">
                {EXPORT_NOTATIONS.map((item) => (
                  <button
                    className={cn(
                      PILL,
                      OPTION_PILL,
                      notation === item.value ? PILL_ACTIVE : PILL_IDLE
                    )}
                    data-value={item.value}
                    key={item.value}
                    onClick={handleNotation}
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <pre className="max-h-110 overflow-auto rounded-2xl bg-(--navy-900) p-5.5 font-mono text-[#dce4f2] text-[12.5px] leading-[1.7]">
            <code>{code}</code>
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}
