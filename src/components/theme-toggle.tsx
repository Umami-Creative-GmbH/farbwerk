/**
 * Light/dark toggle for the app chrome.
 *
 * next-themes persists the choice under `farbwerk-theme` and writes the class
 * on `<html>` before paint, so there is no flash on reload.
 */
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback } from "react";
import { HEADER_CONTROL } from "@/components/workspace/chrome-styles";
import { useIsDark } from "@/hooks/use-is-dark";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { setTheme } = useTheme();
  // Read the applied class rather than next-themes' resolved value, so the
  // icon always matches what the page is actually rendering.
  const isDark = useIsDark();

  const toggle = useCallback(() => {
    setTheme(isDark ? "light" : "dark");
  }, [isDark, setTheme]);

  return (
    <button
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(HEADER_CONTROL, "size-[38px]")}
      onClick={toggle}
      type="button"
    >
      {isDark ? (
        <SunIcon className="size-[17px]" />
      ) : (
        <MoonIcon className="size-[17px]" />
      )}
    </button>
  );
}
