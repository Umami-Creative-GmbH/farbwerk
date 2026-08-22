import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { isLocale } from "@/i18n/config";

export const Route = createFileRoute("/$locale")({
  beforeLoad: ({ params }) => {
    // Anything that isn't a supported language is a 404, not a silent
    // fallback — otherwise /pricing would render the home page in English.
    if (!isLocale(params.locale)) {
      throw notFound();
    }

    return { locale: params.locale };
  },
  component: LocaleLayout,
});

function LocaleLayout() {
  return <Outlet />;
}
