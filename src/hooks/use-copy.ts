/**
 * Copy a value to the clipboard and confirm it with a toast.
 *
 * The whole app is click-to-copy — swatches, cells in the info table, export
 * blocks — so the feedback lives here rather than at every call site.
 */
import { useTranslate } from "@tolgee/react";
import { useCallback } from "react";
import { toast } from "sonner";

export function useCopy(): (value: string, message?: string) => Promise<void> {
  const { t } = useTranslate();

  return useCallback(
    async (value: string, message?: string) => {
      try {
        await navigator.clipboard.writeText(value);
        toast.success(message ?? t("toast.copied"), { description: value });
      } catch {
        toast.error(t("toast.copy-failed"));
      }
    },
    [t]
  );
}
