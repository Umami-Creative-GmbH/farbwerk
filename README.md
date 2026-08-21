# TanStack Start + shadcn/ui

This is a template for a new TanStack Start project with React, TypeScript, and shadcn/ui.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button";
```

## Internationalization

Translations run through [Tolgee](https://tolgee.io). Locales live in the URL
(`/en/...`, `/de/...`); `/` redirects to the best match for the visitor's
`Accept-Language` header.

### Where things live

| Path | Purpose |
| --- | --- |
| `src/i18n/config.ts` | Supported locales, default locale, display names |
| `src/i18n/en.json`, `de.json` | The translations themselves, synced with Tolgee |
| `src/i18n/tolgee.ts` | Tolgee instance (one per browser session, one per SSR render) |
| `src/i18n/detect.ts` | `Accept-Language` matching for `/` |
| `src/i18n/use-locale.ts` | `useLocale()` — the active locale |
| `src/routes/$locale/` | Every page, under its locale segment |
| `tolgee.config.cjs` | CLI config for push/pull |

### Translating

```tsx
import { useTranslate } from "@tolgee/react"

const { t } = useTranslate()
return <h1>{t("home.title")}</h1>
```

Route `head` functions run outside React, so they use `translateStatic(locale, key)`
from `src/i18n/static-translation.ts`. The extractor can't see through that call —
add a `// @tolgee-key <key>` comment above it so `i18n:sync` doesn't treat the key
as unused.

### Adding a language

Add the tag to `locales` and `localeNames` in `src/i18n/config.ts` and to
`pull.languages` in `tolgee.config.cjs`, add the language in Tolgee, then
`bun run i18n:pull` and import the new file in `src/i18n/translations.ts`.
The router, the `<html lang>` attribute, and the language switcher all follow
from the `locales` list.

### Syncing with Tolgee

Copy `.env.example` to `.env.local` and fill in your instance URL, project ID,
and API key. Both the CLI and the dev server read those variables.

```bash
bun run i18n:pull
```

| Script | What it does |
| --- | --- |
| `i18n:pull` | Downloads translations into `src/i18n/` |
| `i18n:push` | Uploads local translations (existing ones are kept, not overwritten) |
| `i18n:compare` | Shows how keys in the code differ from the Tolgee project |
| `i18n:sync` | Creates missing keys in Tolgee from the code |

While the Tolgee project has no keys at all, `i18n:compare` and `i18n:sync`
fail with `Cannot read properties of undefined (reading "keys")` — the CLI
does not handle an empty project. Run `bun run i18n:push` once to seed it and
both commands start working.

With `TOLGEE_API_KEY` set, `bun run dev` enables in-context editing — alt-click
any string to edit it. Production builds never talk to the instance: they render
from the bundled JSON, and the API key is stripped from the bundle.
