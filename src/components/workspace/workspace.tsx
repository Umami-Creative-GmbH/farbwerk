/**
 * The main column: a sticky toolbar over the tab panels.
 *
 * The toolbar carries the palette's identity (name, step count, the base in
 * OKLCH) on the left and the three actions on the right, then the swatch strip,
 * then the tab bar — so the palette stays on screen while you scroll through
 * whichever panel you are working in.
 */
import { useTranslate } from "@tolgee/react";
import { ShuffleIcon } from "lucide-react";
import { useCallback, useState } from "react";

import { PaletteGallery } from "@/components/gallery/palette-gallery";
import { usePalette } from "@/components/palette/palette-context";
import { ScaleStrip } from "@/components/palette/scale-strip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRoleNames } from "@/hooks/use-role-names";
import { useRoleLabels } from "@/i18n/labels";
import { formatColor } from "@/lib/color/convert";
import { SCALE_KEYS } from "@/lib/color/types";
import type { ScaleKey } from "@/lib/color/types";
import { randomBase } from "@/lib/palette/state";

import { ACCENT_BUTTON, ACTION_BUTTON } from "./chrome-styles";
import { ColorInfoTab } from "./color-info";
import { ContrastMatrixTab } from "./contrast-matrix";
import { ExportDialog } from "./export-dialog";
import { SavePaletteButton } from "./save-palette-button";
import { ScaleEditorTab } from "./scale-editor";

const TABS = ["preview", "matrix", "info", "edit"] as const;

type WorkspaceTab = (typeof TABS)[number];

/** Spelled out, not composed, so `tolgee extract` can see the keys. */
function useTabLabels(): Record<WorkspaceTab, string> {
  const { t } = useTranslate();

  return {
    edit: t("tabs.edit"),
    info: t("tabs.info"),
    matrix: t("tabs.matrix"),
    preview: t("tabs.preview"),
  };
}

/**
 * Underline tabs, per the reference: 3px pink bar sitting on the container's
 * hairline.
 *
 * The geometry overrides carry shadcn's own `group-data-horizontal/tabs:`
 * prefix on purpose. Its base classes are variant-scoped, so a plain
 * `after:h-[3px]` does not replace `group-data-horizontal/tabs:after:h-0.5` —
 * twMerge keeps both and the variant wins. Matching the prefix is what makes
 * the override actually apply.
 */
const TAB_TRIGGER = [
  "flex-none rounded-none px-3.5 pt-2.5 pb-3.5",
  "font-heading text-[12px] uppercase tracking-[0.12em]",
  "text-(--text-muted)",
  "group-data-horizontal/tabs:after:bottom-[-1px]",
  "group-data-horizontal/tabs:after:h-[3px]",
  "after:bg-(--pink-500)",
].join(" ");

/** Same story: the list is pinned to h-8 by a variant class. */
const TAB_LIST = "mt-[18px] gap-1 p-0 group-data-horizontal/tabs:h-auto";

export function Workspace() {
  const { t } = useTranslate();
  const { state, dispatch, fieldsFor } = usePalette();
  const roleNames = useRoleNames();
  const roleLabels = useRoleLabels();
  const tabLabels = useTabLabels();
  const [selected, setSelected] = useState<ScaleKey>(500);

  const active = fieldsFor(state.active);

  const handleSelect = useCallback((step: ScaleKey) => {
    setSelected(step);
  }, []);

  const handleRandom = useCallback(() => {
    dispatch({ base: randomBase(), type: "randomize" });
  }, [dispatch]);

  return (
    <div className="flex min-w-0 flex-col">
      <Tabs className="gap-0" defaultValue="preview" onValueChange={undefined}>
        <div className="sticky top-(--fw-header-height) z-30 border-b border-(--border-subtle) bg-(--surface-subtle) px-8 pt-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-5">
            <div className="flex min-w-0 flex-wrap items-center gap-3">
              <span className="font-heading text-[23px] tracking-[-0.02em] text-(--text-heading)">
                {roleNames[state.active] ?? roleLabels[state.active]}
              </span>
              <span className="font-heading rounded-full bg-(--pink-100) px-3 py-1.5 text-[11px] tracking-[0.14em] text-(--fw-pink-ink) uppercase">
                {t("toolbar.steps", { count: SCALE_KEYS.length })}
              </span>
              {active ? (
                <span className="font-mono text-[12px] text-(--text-muted)">
                  {formatColor(active.base, "oklch")}
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                className={ACTION_BUTTON}
                onClick={handleRandom}
                type="button"
              >
                <ShuffleIcon className="size-3.5" />
                {t("sidebar.random")}
              </button>
              <ExportDialog />
              <SavePaletteButton className={ACCENT_BUTTON} />
            </div>
          </div>

          <ScaleStrip onSelect={handleSelect} selected={selected} />

          <TabsList className={TAB_LIST} variant="line">
            {TABS.map((tab) => (
              <TabsTrigger className={TAB_TRIGGER} key={tab} value={tab}>
                {tabLabels[tab]}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="min-w-0 px-8 pt-6 pb-12">
          <TabsContent value="preview">
            <PaletteGallery />
          </TabsContent>
          <TabsContent value="matrix">
            <ContrastMatrixTab />
          </TabsContent>
          <TabsContent value="info">
            <ColorInfoTab />
          </TabsContent>
          <TabsContent value="edit">
            <ScaleEditorTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
