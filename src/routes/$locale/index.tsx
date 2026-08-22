import { createFileRoute } from "@tanstack/react-router";
import { MobileNotice } from "@/components/mobile-notice";
import { PaletteProvider } from "@/components/palette/palette-provider";
import { AppFooter, AppHeader } from "@/components/workspace/app-chrome";
import { PaletteSidebar } from "@/components/workspace/palette-sidebar";
import { Workspace } from "@/components/workspace/workspace";
import { defaultLocale, isLocale, locales } from "@/i18n/config";
import { translateStatic } from "@/i18n/static-translation";
import { absoluteUrl, ogCard, ogLocale, xCard } from "@/lib/site";

export const Route = createFileRoute("/$locale/")({
  head: ({ params }) => {
    const locale = isLocale(params.locale) ? params.locale : defaultLocale;

    // translateStatic is invisible to the Tolgee extractor, so declare the
    // keys here — otherwise `i18n:sync` would treat them as unused.
    // @tolgee-key home.meta-title
    // @tolgee-key home.description
    const title = translateStatic(locale, "home.meta-title");
    const description = translateStatic(locale, "home.description");
    const url = absoluteUrl(`/${locale}`);
    const og = ogCard(locale);
    const x = xCard(locale);

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:image", content: og.url },
        { property: "og:image:width", content: og.width },
        { property: "og:image:height", content: og.height },
        { property: "og:image:alt", content: title },
        { property: "og:locale", content: ogLocale(locale) },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: x.url },
        { name: "twitter:image:alt", content: title },
      ],
      links: [
        { rel: "canonical", href: url },
        // One alternate per language plus x-default, so a search engine ranks
        // the seven translations as one page rather than as duplicates.
        ...locales.map((alternate) => ({
          rel: "alternate",
          hrefLang: alternate,
          href: absoluteUrl(`/${alternate}`),
        })),
        {
          rel: "alternate",
          hrefLang: "x-default",
          href: absoluteUrl(`/${defaultLocale}`),
        },
      ],
    };
  },
  component: App,
});

function App() {
  return (
    <PaletteProvider>
      <div className="min-h-svh bg-[var(--surface-subtle)] text-[var(--text-body)]">
        <AppHeader />
        {/*
          Full-bleed app shell rather than a centred page: the sidebar is a
          fixed 340px panel and the workspace takes whatever is left, so the
          swatch strip and the gallery get the full width of the display.
        */}
        <div className="grid items-start lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
          <PaletteSidebar />
          <Workspace />
        </div>
        <AppFooter />
        <MobileNotice />
      </div>
    </PaletteProvider>
  );
}
