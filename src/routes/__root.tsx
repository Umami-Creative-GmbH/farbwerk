import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TolgeeProvider, useTranslate } from "@tolgee/react";
import { ThemeProvider } from "next-themes";
import { useState } from "react";

import { Toaster } from "@/components/ui/sonner";
import { getTolgee } from "@/i18n/tolgee";
import { staticData } from "@/i18n/translations";
import { useLocale } from "@/i18n/use-locale";
import { SITE_NAME } from "@/lib/site";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Farbwerk ⦁ Tailwind scale generator",
      },
      // Everything locale-dependent — description, og:image, canonical — is
      // set by the page route. What stays here is true of every document.
      {
        property: "og:site_name",
        content: SITE_NAME,
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      // The navy that the dark surface is built from, so a standalone window
      // and the mobile browser chrome carry the brand instead of white.
      {
        name: "theme-color",
        content: "#0b1428",
      },
      {
        name: "apple-mobile-web-app-title",
        content: SITE_NAME,
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      // The SVG is the icon of record — it scales and stays crisp. The PNGs
      // are for the browsers that ignore it, and favicon.ico for the older
      // ones that only ever ask for that.
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicons/favicon.svg",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicons/favicon-32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicons/favicon-16.png",
      },
      {
        rel: "icon",
        sizes: "any",
        href: "/favicons/favicon.ico",
      },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/favicons/apple-touch-icon-180.png",
      },
      {
        rel: "manifest",
        href: "/manifest.json",
      },
    ],
  }),
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
});

function NotFound() {
  const { t } = useTranslate();

  return (
    <main className="container mx-auto p-4 pt-16">
      <h1>{t("not-found.title")}</h1>
      <p>{t("not-found.description")}</p>
    </main>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  // One instance per browser session, one per server render — see getTolgee.
  const [tolgee] = useState(getTolgee);

  return (
    // next-themes writes the theme class on <html> before React hydrates,
    // which is a deliberate mismatch rather than a bug.
    <html lang={locale} suppressHydrationWarning>
      <head>
        <HeadContent />
        {/*
          Self-hosted Umami analytics. Deferred, so it never blocks the first
          paint, and cookieless, so there is no consent banner to gate it
          behind. It sits here rather than in the route `head` because the
          router unmounts head scripts once the client hydrates.
        */}
        <script
          data-website-id="4cb3a826-90ad-45c5-9e75-60dcc9d7985f"
          defer
          src="https://is.umami-creative.de/script.js"
        />
      </head>
      <body>
        {/*
          `ssr` hands Tolgee the locale and translations before the first
          render, so the server and the client produce identical markup. It
          also drives language changes on later client-side navigations.
        */}
        <TolgeeProvider ssr={{ language: locale, staticData }} tolgee={tolgee}>
          {/*
            The theme lands on <html> before paint and persists under
            `farbwerk-theme`, so a reload never flashes the wrong mode.
          */}
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            disableTransitionOnChange
            enableSystem
            storageKey="farbwerk-theme"
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </TolgeeProvider>
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
