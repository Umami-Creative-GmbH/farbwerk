import { Link, useRouterState } from "@tanstack/react-router";
import { useTranslate } from "@tolgee/react";
import { ChevronDownIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HEADER_CONTROL } from "@/components/workspace/chrome-styles";
import { type Locale, localeNames, locales } from "@/i18n/config";
import { FLAG_HEIGHT, FLAG_WIDTH, localeEmoji, localeFlag } from "@/i18n/flags";
import { useLocale } from "@/i18n/use-locale";
import { cn } from "@/lib/utils";

const keepSearch = (previous: Record<string, unknown>) => previous;

/**
 * A country flag where one exists, the locale's stand-in emoji where it does
 * not. Decorative — the language name sits right beside it.
 */
function LocaleFlag({ locale }: { locale: Locale }) {
  const src = localeFlag[locale];

  if (!src) {
    return (
      <span aria-hidden="true" className="w-4.5 text-center text-[15px]">
        {localeEmoji[locale]}
      </span>
    );
  }

  return (
    <img
      alt=""
      className="h-[13.5px] w-4.5 rounded-[2px] object-cover"
      height={FLAG_HEIGHT}
      src={src}
      width={FLAG_WIDTH}
    />
  );
}

/**
 * Swaps the `$locale` URL segment while staying on the current page.
 *
 * Every entry is a real link, so each language stays crawlable and can be
 * opened in a new tab — the dropdown is only the presentation.
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
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("language-switcher.label")}
        className={cn(
          HEADER_CONTROL,
          "h-9.5 gap-2.5 px-3.5 font-heading text-[12px] uppercase tracking-widest"
        )}
      >
        <LocaleFlag locale={activeLocale} />
        <span className="hidden sm:inline">{localeNames[activeLocale]}</span>
        <ChevronDownIcon className="size-3.5 opacity-70" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        // rounded-[16px], not rounded-2xl: the theme scales its radius steps
        // off --radius, which lands 2xl at 25px rather than the design's 16.
        className="min-w-47.5 gap-0.5 rounded-[16px] p-2 shadow-[0_16px_40px_rgba(18,33,67,.22)]"
      >
        {locales.map((locale) => {
          const isActive = locale === activeLocale;
          return (
            <DropdownMenuItem
              className="rounded-[10px] p-0"
              key={locale}
              render={<span />}
            >
              <Link
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "grid w-full grid-cols-[22px_minmax(0,1fr)_auto] items-center gap-2.5 rounded-[10px] px-2.5 py-2.5 font-heading text-[13px]",
                  isActive && "bg-(--surface-muted) font-medium"
                )}
                hrefLang={locale}
                // biome-ignore lint/performance/noJsxPropsBind: TanStack types the param reducer against the matched route, so hoisting it costs more in casts than seven closures cost at runtime.
                params={(previous) => ({ ...previous, locale })}
                search={keepSearch}
                // Every localized route carries a `locale` param, so "/$locale"
                // stands in for whichever one is actually matched — the runtime
                // value is the real `fullPath` read above.
                to={currentRoute as "/$locale"}
              >
                <LocaleFlag locale={locale} />
                <span className="truncate">{localeNames[locale]}</span>
                <span className="font-mono text-[10.5px] opacity-55">
                  {locale}
                </span>
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
