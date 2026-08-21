import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TolgeeProvider, useTranslate } from "@tolgee/react";
import { useState } from "react";
import { getTolgee } from "@/i18n/tolgee";
import { staticData } from "@/i18n/translations";
import { useLocale } from "@/i18n/use-locale";

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
        title: "TanStack Start Starter",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
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
    <html lang={locale}>
      <head>
        <HeadContent />
      </head>
      <body>
        {/*
          `ssr` hands Tolgee the locale and translations before the first
          render, so the server and the client produce identical markup. It
          also drives language changes on later client-side navigations.
        */}
        <TolgeeProvider ssr={{ language: locale, staticData }} tolgee={tolgee}>
          {children}
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
