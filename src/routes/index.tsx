import { createFileRoute, redirect } from "@tanstack/react-router";
import { detectLocale } from "@/i18n/detect";

/**
 * Every page lives under a locale, so `/` only picks one and gets out of the
 * way. `replace` keeps the bare URL out of the history stack, so Back from
 * /en goes to wherever the visitor came from.
 */
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({
      to: "/$locale",
      params: { locale: detectLocale() },
      replace: true,
    });
  },
});
