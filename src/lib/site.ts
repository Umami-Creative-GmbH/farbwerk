import type { Locale } from "@/i18n/config";

/** Trailing slashes, stripped so `${SITE_URL}/en` never doubles up. */
const TRAILING_SLASHES = /\/+$/;

const PRODUCTION_URL = "https://farbwerk.umami-creative.app";

/** Matches `vite dev --port 3000` in package.json. */
const DEV_URL = "http://localhost:3000";

/**
 * Canonical origin of the deployment.
 *
 * Social scrapers and search engines resolve `og:image` and `canonical`
 * against the crawled URL only inconsistently, so both are written out
 * absolute. Point `VITE_SITE_URL` at the environment being built — preview
 * deploys included — and everything in the document head follows.
 *
 * Without it a dev server used to advertise the production origin: the cards
 * are right there in `public/opengraph/`, but the tags named a host the dev
 * machine cannot reach, so every preview tool reported a broken image. The
 * dev fallback keeps those URLs resolvable against the server actually
 * serving them. It is a constant rather than `location.origin` so that the
 * SSR pass and the client emit an identical head.
 */
export const SITE_URL = (
  import.meta.env.VITE_SITE_URL ??
  (import.meta.env.DEV ? DEV_URL : PRODUCTION_URL)
).replace(TRAILING_SLASHES, "");

export const SITE_NAME = "Farbwerk";

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

/**
 * Language of the social cards. Only two were drawn: Franconian rides along
 * with German, and the remaining locales take the English card rather than
 * pointing a scraper at a missing image.
 */
const CARD_LANGUAGE: Record<Locale, "de" | "en"> = {
  de: "de",
  "de-frk": "de",
  en: "en",
  es: "en",
  fr: "en",
  it: "en",
  tlh: "en",
};

/**
 * BCP-47 tags for `og:locale`, which wants underscores and a region. The two
 * invented locales borrow their parent's, since neither is a tag any consumer
 * would recognise.
 */
const OG_LOCALE: Record<Locale, string> = {
  de: "de_DE",
  "de-frk": "de_DE",
  en: "en_GB",
  es: "es_ES",
  fr: "fr_FR",
  it: "it_IT",
  tlh: "en_GB",
};

export function ogLocale(locale: Locale): string {
  return OG_LOCALE[locale];
}

export interface SocialCard {
  height: string;
  url: string;
  width: string;
}

/** The 1.91:1 card, for Open Graph consumers: Facebook, LinkedIn, Slack. */
export function ogCard(locale: Locale): SocialCard {
  return {
    height: "630",
    url: absoluteUrl(
      `/opengraph/farbwerk-og-1200x630-${CARD_LANGUAGE[locale]}.png`
    ),
    width: "1200",
  };
}

/** The 16:9 card, which X crops less aggressively than the Open Graph one. */
export function xCard(locale: Locale): SocialCard {
  return {
    height: "675",
    url: absoluteUrl(
      `/opengraph/farbwerk-x-card-1200x675-${CARD_LANGUAGE[locale]}.png`
    ),
    width: "1200",
  };
}
