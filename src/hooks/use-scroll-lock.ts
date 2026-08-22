import { useEffect } from "react";

/**
 * Freezes document scrolling for as long as the calling component is mounted.
 *
 * Base UI already sets `overflow: hidden` on `<body>` for a modal dialog, but
 * `<html>` is the scrolling element here, so the page still scrolled behind an
 * open dialog. Locking `<html>` is the part that was missing.
 *
 * It matters more than the usual "don't scroll the page behind a modal": the
 * editor rail overflows a phone viewport sideways, and a fixed backdrop only
 * ever covers the viewport. Being able to pan the page moved content out from
 * under the backdrop. Locking `<html>` clips that overflow while the dialog is
 * up, so there is nothing to pan to.
 *
 * The count is module-level on purpose. Two dialogs open at once must not have
 * the first one to unmount release the lock for both.
 */
let lockCount = 0;
let restoreOverflow = "";

export function useScrollLock() {
  useEffect(() => {
    const { style } = document.documentElement;

    if (lockCount === 0) {
      // Capture the inline value, not the computed one — restoring a computed
      // `visible` would leave an inline override behind that was never there.
      restoreOverflow = style.overflow;
      style.overflow = "hidden";
    }
    lockCount += 1;

    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        style.overflow = restoreOverflow;
      }
    };
  }, []);
}
