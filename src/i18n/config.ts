export const locales = ["en", "de"] as const;

export type Locale = (typeof locales)[number];

/**
 * Base language of the project. Keys are authored in this language and it is
 * the fallback whenever a translation is missing.
 */
export const defaultLocale: Locale = "en";

/** Language names, each written in its own language. */
export const localeNames: Record<Locale, string> = {
  de: "Deutsch",
  en: "English",
};

export function isLocale(value: unknown): value is Locale {
  return locales.includes(value as Locale);
}
