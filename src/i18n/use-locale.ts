import { useParams } from "@tanstack/react-router";

import type { Locale } from "./config";
import { defaultLocale, isLocale } from "./config";

/**
 * Active locale, taken from the `/$locale` URL segment.
 *
 * Falls back to the default outside that tree — the root shell also renders
 * for URLs that never matched a locale, such as a 404.
 */
export function useLocale(): Locale {
  const { locale } = useParams({ strict: false });
  return isLocale(locale) ? locale : defaultLocale;
}
