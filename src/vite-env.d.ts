/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Tolgee Project API Key, for in-context editing. Development only. */
  readonly TOLGEE_API_KEY?: string;
  /** Base URL of the self-hosted Tolgee instance. Development only. */
  readonly TOLGEE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
