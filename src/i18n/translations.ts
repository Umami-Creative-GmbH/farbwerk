import type { TolgeeStaticData } from "@tolgee/react";
import de from "./de.json";
import en from "./en.json";

/**
 * Translations bundled with the app. Production renders entirely from these,
 * so it never talks to the Tolgee instance. Refresh with `bun run i18n:pull`.
 */
export const staticData: TolgeeStaticData = { de, en };
