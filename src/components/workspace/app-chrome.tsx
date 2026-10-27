/**
 * Header and footer — the Umami Creative chrome around the workspace.
 *
 * The header is the design system's inverse panel: navy, 84px, sticky, with the
 * 3px rainbow hairline along its base. That hairline is the one place all four
 * brand accents appear together; everywhere else a single accent punctuates at
 * a time. The square pink dot beside the wordmark echoes the logo's one
 * intentionally sharp shape.
 */
import { useTranslate } from "@tolgee/react";
import { HeartIcon } from "lucide-react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

/** The agency site the wordmark and the footer byline both point at. */
const AGENCY_URL = "https://umami-creative.de/";

/** Intrinsic size of the wordmark, so the header reserves the right box. */
const WORDMARK_WIDTH = 504;
const WORDMARK_HEIGHT = 176;

export function AppHeader() {
  const { t } = useTranslate();

  return (
    <header className="sticky top-0 z-50 h-(--fw-header-height) bg-(--navy-800)">
      <div className="mx-auto flex h-full min-w-0 items-center justify-between gap-6 px-8">
        <div className="flex min-w-0 items-center gap-5">
          {/* The wordmark ships as a flat white SVG, so it needs no dark-mode
              variant — the header is navy in both themes. Its alt text is the
              link's accessible name, so the anchor needs no label of its own. */}
          <a
            className="block shrink-0 transition-opacity hover:opacity-80"
            href={AGENCY_URL}
            rel="noopener"
            target="_blank"
          >
            <img
              alt="Umami Creative"
              className="block h-8 w-auto"
              height={WORDMARK_HEIGHT}
              src="/umami-wordmark-white.svg"
              width={WORDMARK_WIDTH}
            />
          </a>
          <span aria-hidden="true" className="block h-8.5 w-px bg-white/22" />
          <span className="flex min-w-0 items-baseline gap-2">
            <span className="font-heading text-[21px] font-semibold tracking-[-0.02em] text-white">
              {t("app.brand")}
            </span>
            <span
              aria-hidden="true"
              className="inline-block size-1.75 rounded-[2px] bg-(--pink-500)"
            />
            <span className="font-heading ml-2 text-[11px] tracking-[0.16em] whitespace-nowrap text-(--text-on-inverse-muted) uppercase">
              {t("home.eyebrow")}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
      <div
        aria-hidden="true"
        className="absolute right-0 bottom-0 left-0 h-0.75"
        style={{ background: "var(--gradient-rainbow)" }}
      />
    </header>
  );
}

export function AppFooter() {
  const { t } = useTranslate();

  return (
    <footer className="relative bg-(--navy-800) px-8 py-7 text-[13px] text-(--text-on-inverse-muted)">
      {/* The rainbow hairline bookends the page: base of the header, top of
          the footer. */}
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 left-0 h-0.75"
        style={{ background: "var(--gradient-rainbow)" }}
      />
      <div className="flex flex-wrap items-center justify-between gap-6">
        <span className="inline-flex items-center gap-1.75">
          <span>{t("app.footer.tag")}</span>
          <HeartIcon
            aria-hidden="true"
            className="size-3.75 fill-(--pink-500) text-(--pink-500)"
          />
          <a
            className="text-inherit hover:text-white"
            href={AGENCY_URL}
            rel="noopener"
            target="_blank"
          >
            {t("app.footer.by")}
          </a>
        </span>
        <span className="font-heading flex gap-6 text-[11px] tracking-[0.16em] uppercase">
          {/* The legal pages live on the agency site, not in this app. */}
          <a
            className="text-inherit hover:text-white"
            href="https://umami-creative.de/impressum"
          >
            {t("app.footer.imprint")}
          </a>
          <a
            className="text-inherit hover:text-white"
            href="https://umami-creative.de/datenschutz"
          >
            {t("app.footer.privacy")}
          </a>
        </span>
      </div>
    </footer>
  );
}
