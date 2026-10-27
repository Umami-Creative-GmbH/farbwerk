import { FormatIcu } from "@tolgee/format-icu";
import type { TolgeeInstance } from "@tolgee/react";
import { DevTools, Tolgee } from "@tolgee/react";

import { defaultLocale, locales } from "./config";
import { staticData } from "./translations";

function createTolgee(): TolgeeInstance {
  return (
    Tolgee()
      .use(DevTools())
      // Keys are authored in ICU, matching `format: "JSON_ICU"` in
      // .tolgeerc.json — needed for plurals and number/date formatting.
      .use(FormatIcu())
      .init({
        availableLanguages: [...locales],
        defaultLanguage: defaultLocale,
        fallbackLanguage: defaultLocale,
        staticData,

        // In-context editing, development only. Vite drops this branch from
        // the production bundle, so no API key or instance URL ever ships.
        ...(import.meta.env.DEV
          ? {
              apiKey: import.meta.env.TOLGEE_API_KEY,
              apiUrl: import.meta.env.TOLGEE_API_URL,
            }
          : {}),
      })
  );
}

let browserInstance: TolgeeInstance | undefined;

/**
 * The browser reuses one instance for the lifetime of the page. The server
 * builds a fresh one per render, because `TolgeeProvider`'s `ssr` option
 * mutates the instance it is given (language and cache) — a shared instance
 * would let concurrent requests overwrite each other's locale.
 */
export function getTolgee(): TolgeeInstance {
  if (import.meta.env.SSR) {
    return createTolgee();
  }

  browserInstance ??= createTolgee();
  return browserInstance;
}
