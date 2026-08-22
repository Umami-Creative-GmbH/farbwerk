import deFlag from "flag-icons/flags/4x3/de.svg";
import esFlag from "flag-icons/flags/4x3/es.svg";
import frFlag from "flag-icons/flags/4x3/fr.svg";
import gbFlag from "flag-icons/flags/4x3/gb.svg";
import itFlag from "flag-icons/flags/4x3/it.svg";
import type { Locale } from "./config";

/**
 * Flags for the language picker.
 *
 * The five SVGs are imported individually rather than through
 * `flag-icons/css/flag-icons.min.css`: that stylesheet declares all 271 flags,
 * so the bundler would emit every one of them and ship ~60 KB of CSS to render
 * five.
 */
export const localeFlag: Record<Locale, string | null> = {
  de: deFlag,
  "de-frk": null,
  en: gbFlag,
  es: esFlag,
  fr: frFlag,
  it: itFlag,
  tlh: null,
};

/**
 * Stand-ins for the two locales with no country behind them — a pretzel for
 * Franconian, a salute for Klingon. The only emoji in the app, which the design
 * system permits precisely here.
 */
export const localeEmoji: Record<Locale, string | null> = {
  de: null,
  "de-frk": "🥨",
  en: null,
  es: null,
  fr: null,
  it: null,
  tlh: "🖖",
};

/** Intrinsic size of a flag-icons 4x3 SVG. */
export const FLAG_WIDTH = 640;
export const FLAG_HEIGHT = 480;
