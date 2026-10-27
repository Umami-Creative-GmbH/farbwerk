/**
 * Save palette — the single accent action in the workspace.
 */
import { useTranslate } from "@tolgee/react";
import { useCallback } from "react";
import { toast } from "sonner";

import { usePalette } from "@/components/palette/palette-context";
import { useRoleNames } from "@/hooks/use-role-names";
import { useSavedPalettes } from "@/hooks/use-saved-palettes";

export interface SavePaletteButtonProps {
  className?: string;
}

export function SavePaletteButton({ className }: SavePaletteButtonProps) {
  const { t } = useTranslate();
  const { state } = usePalette();
  const { save } = useSavedPalettes();
  const roleNames = useRoleNames();
  const primaryName = roleNames.primary;

  const handleSave = useCallback(() => {
    const name = primaryName || "Untitled";
    save(state, name);
    toast.success(t("toast.saved", { name }));
  }, [state, save, t, primaryName]);

  return (
    <button className={className} onClick={handleSave} type="button">
      {t("sidebar.save")}
    </button>
  );
}
