"use strict";

// `bun run` does not forward .env.local into the CLI's Node process, and the
// CLI has no dotenv of its own, so load it here. Real environment variables
// (CI, shell) already present are left untouched by loadEnvFile.
for (const envFile of [".env", ".env.local"]) {
  try {
    process.loadEnvFile(envFile);
  } catch {
    // Not every environment has a local env file; CI passes real vars.
  }
}

/** @type {import('@tolgee/cli').TolgeeConfig} */
module.exports = {
  $schema: "https://docs.tolgee.io/cli-schema.json",
  apiKey: process.env.TOLGEE_API_KEY,
  apiUrl: process.env.TOLGEE_API_URL,
  format: "JSON_TOLGEE",

  // Where `tolgee extract` / `compare` / `sync` look for t() calls and <T> tags.
  parser: "react",
  patterns: ["./src/**/*.ts", "./src/**/*.tsx"],
  projectId: process.env.TOLGEE_PROJECT_ID,

  pull: {
    // JSON_TOLGEE is a flat format, so keep "." literal in key names
    // instead of letting it nest the output.
    delimiter: null,
    fileStructureTemplate: "{languageTag}.json",
    // The Tolgee project carries more languages than the app ships.
    // Keep this in step with `locales` in src/i18n/config.ts.
    languages: ["en", "de"],
    path: "./src/i18n",
  },

  push: {
    filesTemplate: "./src/i18n/{languageTag}.json",
    // Never clobber what translators changed on the platform.
    forceMode: "KEEP",
  },
  strictNamespace: false,
};
