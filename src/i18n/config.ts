export const locales = ["en", "de", "fr", "es", "it", "de-frk", "tlh"] as const;

export type Locale = (typeof locales)[number];

/**
 * Base language of the project. Keys are authored in this language and it is
 * the fallback whenever a translation is missing.
 */
export const defaultLocale: Locale = "en";

/** Language names, each written in its own language. */
export const localeNames: Record<Locale, string> = {
  de: "Deutsch",
  "de-frk": "Fränkisch",
  en: "English",
  es: "Español",
  fr: "Français",
  it: "Italiano",
  tlh: "tlhIngan Hol",
};

/**
 * Locales that only carry overrides. Their dictionary is merged onto the
 * parent's, so an untranslated key falls back to the parent language rather
 * than all the way to English.
 */
export const localeParents: Partial<Record<Locale, Locale>> = {
  "de-frk": "de",
  tlh: "en",
};

export function isLocale(value: unknown): value is Locale {
  return locales.includes(value as Locale);
}
