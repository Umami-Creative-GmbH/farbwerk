import type { TolgeeStaticData } from "@tolgee/react";

import { localeParents } from "./config";
import type { Locale } from "./config";
import deFrk from "./de-frk.json";
import de from "./de.json";
import en from "./en.json";
import es from "./es.json";
import fr from "./fr.json";
import it from "./it.json";
import tlh from "./tlh.json";

type Dictionary = Record<string, string>;

/** Authored dictionaries, before inheritance is applied. */
const source: Record<Locale, Dictionary> = {
  de,
  "de-frk": deFrk,
  en,
  es,
  fr,
  it,
  tlh,
};

/**
 * `de-frk` and `tlh` are override-only dictionaries: they carry the keys worth
 * saying differently and inherit the rest from their parent, so an untranslated
 * key reads as German or English rather than falling through to a raw key.
 */
function withParent(locale: Locale): Dictionary {
  const parent = localeParents[locale];
  if (!parent) {
    return source[locale];
  }
  return { ...withParent(parent), ...source[locale] };
}

/**
 * Translations bundled with the app. Production renders entirely from these,
 * so it never talks to the Tolgee instance. Refresh with `bun run i18n:pull`.
 */
export const staticData: TolgeeStaticData = {
  de: withParent("de"),
  "de-frk": withParent("de-frk"),
  en: withParent("en"),
  es: withParent("es"),
  fr: withParent("fr"),
  it: withParent("it"),
  tlh: withParent("tlh"),
};
