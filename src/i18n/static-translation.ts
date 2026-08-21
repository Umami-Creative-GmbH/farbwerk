import type { Locale } from "./config";
import { defaultLocale } from "./config";
import { staticData } from "./translations";

/**
 * Resolve a key straight out of the bundled translations.
 *
 * Route `head` functions run outside React, where `useTranslate` is not
 * available. Document metadata is plain text with no ICU arguments, so
 * reading the same JSON Tolgee reads is enough. Use `useTranslate`
 * everywhere else.
 */
export function translateStatic(locale: Locale, key: string): string {
  return lookUp(locale, key) ?? lookUp(defaultLocale, key) ?? key;
}

function lookUp(locale: Locale, key: string): string | undefined {
  // JSON_TOLGEE is a flat format: "home.title" is one literal key, not a path.
  const value = (staticData[locale] as Record<string, unknown> | undefined)?.[
    key
  ];

  return typeof value === "string" ? value : undefined;
}
