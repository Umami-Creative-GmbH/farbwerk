import { createFileRoute } from "@tanstack/react-router";
import { useTranslate } from "@tolgee/react";
import { type ChangeEvent, useCallback, useState } from "react";
import { PaletteGallery } from "@/components/gallery/palette-gallery";
import { usePalette } from "@/components/palette/palette-context";
import { PaletteProvider } from "@/components/palette/palette-provider";
import { ScaleStrip } from "@/components/palette/scale-strip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { defaultLocale, isLocale } from "@/i18n/config";
import { translateStatic } from "@/i18n/static-translation";
import { normalizeHex } from "@/lib/color/convert";
import { randomBase } from "@/lib/palette/state";

export const Route = createFileRoute("/$locale/")({
  head: ({ params }) => {
    const locale = isLocale(params.locale) ? params.locale : defaultLocale;

    return {
      // translateStatic is invisible to the Tolgee extractor, so declare the
      // key here — otherwise `i18n:sync` would treat it as unused.
      // @tolgee-key home.meta-title
      meta: [{ title: translateStatic(locale, "home.meta-title") }],
    };
  },
  component: App,
});

/**
 * Placeholder for the sidebar from SPEC §4 — just enough control to drive the
 * palette until the real one is built.
 */
function BaseControls() {
  const { state, dispatch } = usePalette();
  const [text, setText] = useState(state.roles.primary.base);

  const commit = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setText(value);
      const hex = normalizeHex(value);
      if (hex) {
        dispatch({ type: "setBase", base: hex });
      }
    },
    [dispatch]
  );

  const roll = useCallback(() => {
    const base = randomBase();
    setText(base);
    dispatch({ type: "randomize", base });
  }, [dispatch]);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor="base-hex">Base color</Label>
        <div className="flex gap-2">
          <Input
            className="w-32 font-mono"
            id="base-hex"
            onChange={commit}
            value={text}
          />
          <Input
            aria-label="Pick base color"
            className="w-14 p-1"
            onChange={commit}
            type="color"
            value={state.roles.primary.base}
          />
        </div>
      </div>
      <Button onClick={roll} variant="outline">
        Random
      </Button>
    </div>
  );
}

function App() {
  const { t } = useTranslate();

  return (
    <PaletteProvider>
      <main className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
        <header className="flex flex-col gap-1">
          <h1 className="font-medium text-2xl">{t("home.title")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("home.description")}
          </p>
        </header>
        <BaseControls />
        <ScaleStrip />
        <PaletteGallery />
      </main>
    </PaletteProvider>
  );
}
