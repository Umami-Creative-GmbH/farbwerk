/**
 * A notice on phone-sized viewports.
 *
 * Farbwerk works side by side — a 340px editor rail, an eleven-step scale and a
 * live gallery — and that column layout has nowhere to go on a phone. The
 * dialog says so once and then gets out of the way: it never blocks, because a
 * palette is still legible stacked, and someone who came here from a phone link
 * should be able to look around.
 *
 * Dismissal is remembered for the session. A warning that returns on every
 * reload is worse than the cramped layout it warns about.
 */
import { useTranslate } from "@tolgee/react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";

const DISMISS_KEY = "farbwerk-mobile-notice";

function wasDismissed(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    return sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    // Blocked storage should cost a repeated notice, never a crash.
    return false;
  }
}

export function MobileNotice() {
  const { t } = useTranslate();
  const isMobile = useIsMobile();
  const [dismissed, setDismissed] = useState(wasDismissed);

  const dismiss = useCallback(() => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Private browsing lands here; remembering is best effort.
    }
  }, []);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      // Esc and the backdrop close it too, and both mean the same thing.
      if (!open) {
        dismiss();
      }
    },
    [dismiss]
  );

  // `useIsMobile` reports false until its effect runs, so this stays closed
  // through SSR and the first paint — no hydration mismatch, no flash.
  return (
    <Dialog onOpenChange={handleOpenChange} open={isMobile && !dismissed}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("mobile.title")}</DialogTitle>
          <DialogDescription>{t("mobile.body")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={dismiss}>{t("mobile.dismiss")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
