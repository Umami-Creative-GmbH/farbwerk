/**
 * Whether the dark theme is currently applied.
 *
 * Reads the `dark` class off `<html>` rather than next-themes' `resolvedTheme`,
 * because that class is what the CSS actually keys on. Anything that has to
 * agree with the rendered theme — the widget gallery picks its token map from
 * this — should read the same source the stylesheet does.
 */
import { useEffect, useState } from "react";

const DARK_CLASS = "dark";

function readIsDark(): boolean {
  return document.documentElement.classList.contains(DARK_CLASS);
}

export function useIsDark(): boolean {
  // The server has no class list; the first client effect corrects it.
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const sync = () => setIsDark(readIsDark());
    sync();

    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributeFilter: ["class"],
      attributes: true,
    });

    return () => observer.disconnect();
  }, []);

  return isDark;
}
