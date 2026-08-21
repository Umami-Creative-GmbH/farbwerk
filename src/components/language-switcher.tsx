import { Link, useRouterState } from "@tanstack/react-router";
import { useTranslate } from "@tolgee/react";
import { localeNames, locales } from "@/i18n/config";
import { useLocale } from "@/i18n/use-locale";
import { cn } from "@/lib/utils";

/**
 * Swaps the `$locale` URL segment while staying on the current page. Renders
 * real links so each language is crawlable and can be opened in a new tab.
 */
export function LanguageSwitcher() {
  const { t } = useTranslate();
  const activeLocale = useLocale();

  // The deepest matched route, e.g. "/$locale/about". Linking to the route
  // pattern and swapping one param keeps the rest of the path intact —
  // `to="."` would only get us back up to the "/$locale" layout.
  const currentRoute = useRouterState({
    select: (state) => state.matches.at(-1)?.fullPath,
  });

  return (
    <nav aria-label={t("language-switcher.label")}>
      <ul className="flex items-center gap-1">
        {locales.map((locale) => (
          <li key={locale}>
            <Link
              aria-current={locale === activeLocale ? "true" : undefined}
              className={cn(
                "rounded-md px-2 py-1 text-sm transition-colors",
                locale === activeLocale
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              hrefLang={locale}
              params={(previous) => ({ ...previous, locale })}
              search={(previous) => previous}
              // Every localized route carries a `locale` param, so "/$locale"
              // stands in for whichever one is actually matched — the runtime
              // value is the real `fullPath` read above.
              to={currentRoute as "/$locale"}
            >
              {localeNames[locale]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
