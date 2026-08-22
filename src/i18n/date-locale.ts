import { de, enGB, es, fr, it } from "date-fns/locale";
import type { Locale as AppLocale } from "./config";

/**
 * date-fns locale per app locale, for the calendar's month and weekday names.
 *
 * The two invented locales borrow their parent's dates: Franconian is written
 * with German month names, and there is no Klingon calendar in date-fns.
 */
const DATE_LOCALES = {
  de,
  "de-frk": de,
  en: enGB,
  es,
  fr,
  it,
  tlh: enGB,
} as const;

export function dateLocale(locale: AppLocale) {
  return DATE_LOCALES[locale];
}
