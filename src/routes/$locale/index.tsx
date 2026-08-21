import { createFileRoute } from "@tanstack/react-router";
import { useTranslate } from "@tolgee/react";
import { Button } from "@/components/ui/button";
import { defaultLocale, isLocale } from "@/i18n/config";
import { translateStatic } from "@/i18n/static-translation";

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

function App() {
  const { t } = useTranslate();

  return (
    <div className="flex min-h-svh p-6">
      <div className="flex min-w-0 max-w-md flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">{t("home.title")}</h1>
          <p>{t("home.description")}</p>
          <p>{t("home.button-hint")}</p>
          <Button className="mt-2">{t("home.button")}</Button>
        </div>
      </div>
    </div>
  );
}
