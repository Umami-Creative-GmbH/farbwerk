# Farbwerk

Turn one color into a Tailwind scale.

Farbwerk takes a base color, builds the eleven Tailwind steps (50–950) in OKLCH,
lets you add a secondary and tertiary scale linked by a harmony rule, scores every
contrast pair with APCA and WCAG 2, and repaints a gallery of real components so
you can see the palette doing its job before you export it.

Built with TanStack Start, React, Tailwind v4 and shadcn/ui.

```bash
bun install
bun run dev
```

## The color engine

Everything colorimetric lives in `src/lib/color/` and is pure, tested and free of
React. `colorjs.io`'s tree-shakeable `fn` entry point does the conversions.

| Module | What it owns |
| --- | --- |
| `convert.ts` | hex ↔ OKLCH ↔ sRGB ↔ HSL, gamut mapping, notation formatting |
| `scale.ts` | The 50–950 ramp: anchor detection and `buildScale` |
| `harmony.ts` | The eight harmony rules and read-time role derivation |
| `contrast.ts` | APCA (signed Lc) and WCAG 2.1, thresholds, the 11×11 matrix |
| `name.ts` | Nearest catalogue name, catalogue injected by the caller |
| `tokens.ts` | Palette → CSS custom properties |
| `export.ts` | Seven export formats × four notations |

Two decisions worth knowing:

**The base is never forced to 500.** `detectAnchorStep` finds the step whose
canonical lightness sits closest to the base and pins it there, so a pasted dark
navy anchors at 900 rather than being dragged to the middle of the ramp.

**Harmony is derived at read time, not written once.** A linked role stores its
own fields but recomputes its base from primary every time it is read, so editing
primary re-derives every linked role everywhere at once.

## How the gallery repaints

`galleryVars()` puts two layers of custom properties on the gallery wrapper: the
raw ramps (`--p-*`, `--s-*`, `--t-*`) and a remap of shadcn's own theme tokens
(`--primary`, `--card`, `--chart-1…5`, `--sidebar*`) onto those steps.

That is why the installed `dashboard-01` block and the chart components repaint
from a generated palette without being modified at all — they keep reading the
tokens they always read, and the wrapper changes what those tokens mean.

## Color names

`color-name-list` is ~32k entries and about 1.3 MB, so it never reaches the
browser. `src/routes/api/color-name.ts` is a server route that dynamically
imports the catalogue and answers `GET /api/color-name?hex=…&hex=…`;
`useColorNames()` calls it, debounced and cached per hex. `src/lib/color/name.ts`
stays catalogue-agnostic precisely so the list can be injected server-side only.

## Adding components

```bash
bun x shadcn@latest add button
```

Components land in `src/components/ui/`.

## Internationalization

Translations run through [Tolgee](https://tolgee.io). Locales live in the URL
(`/en/...`, `/de/...`); `/` redirects to the best match for the visitor's
`Accept-Language` header.

Seven locales ship: `en`, `de`, `fr`, `es`, `it`, plus `de-frk` (Fränkisch) and
`tlh` (tlhIngan Hol). The last two are override-only dictionaries — they carry
the keys worth saying differently and inherit the rest from their parent (`de`
and `en`), so an untranslated key reads as German or English rather than falling
through to a raw key. The merge happens in `src/i18n/translations.ts`.

### Where things live

| Path | Purpose |
| --- | --- |
| `src/i18n/config.ts` | Supported locales, default locale, display names |
| `src/i18n/*.json` | The translations themselves, synced with Tolgee |
| `src/i18n/translations.ts` | Bundled dictionaries, with parent-locale inheritance |
| `src/i18n/date-locale.ts` | date-fns locale per app locale, for the calendar |
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

Add the tag to `locales`, `localeNames` and `localeFlags` in
`src/i18n/config.ts` — and `localeParents` if it should inherit — and to
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
