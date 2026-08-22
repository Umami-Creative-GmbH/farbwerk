import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { detectLanguage } from "@tolgee/react";
import type { Locale } from "./config";
import { defaultLocale, isLocale, locales } from "./config";

/**
 * Language tags from an Accept-Language header, best match first.
 *
 * Tolgee ships `detectLanguageFromHeaders`, but it only inspects the
 * highest-priority entry — a visitor whose first choice is French and second
 * is German would fall through to the default. So we walk the whole
 * q-ordered list and reuse Tolgee's per-tag matching below.
 */
function parseAcceptLanguage(header: string | undefined): string[] {
  if (!header) {
    return [];
  }

  return header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const quality = params
        .map((param) => param.trim())
        .find((param) => param.startsWith("q="))
        ?.slice(2);

      return {
        quality: quality === undefined ? 1 : Number(quality),
        tag: tag?.trim() ?? "",
      };
    })
    .filter(({ tag, quality }) => tag && tag !== "*" && !Number.isNaN(quality))
    .sort((a, b) => b.quality - a.quality)
    .map(({ tag }) => tag);
}

/**
 * First supported locale in `preferred`, falling back to {@link defaultLocale}.
 * Tolgee's `detectLanguage` handles region subtags, so `de-AT` matches `de`.
 */
function matchLocale(preferred: string[]): Locale {
  for (const tag of preferred) {
    const match = detectLanguage(tag, [...locales]);
    if (isLocale(match)) {
      return match;
    }
  }

  return defaultLocale;
}

/**
 * Best guess for a visitor who arrived without a locale in the URL.
 *
 * During SSR this reads the Accept-Language header; for client-side
 * navigations to `/` it reads the browser's language preferences.
 */
export const detectLocale = createIsomorphicFn()
  .server(
    (): Locale =>
      matchLocale(parseAcceptLanguage(getRequestHeader("accept-language")))
  )
  .client((): Locale => matchLocale([...navigator.languages]));
