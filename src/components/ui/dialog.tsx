import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { cn } from "@/lib/utils";

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      className={cn(
        // Sized in viewport units, never percentages. On a page that overflows
        // sideways — this app does, by ~170px on a phone — the initial
        // containing block a fixed element resolves `%` against stretches to
        // the content width, so `inset-0` produced a backdrop wider than the
        // screen. `100vw` measures the screen itself.
        //
        // Height is `dvh` rather than `vh` because `vh` is the *largest* the
        // viewport ever gets: with a mobile URL bar on screen it would push
        // the backdrop past the fold. `dvh` tracks what is actually visible.
        "data-open:fade-in-0 data-closed:fade-out-0 fixed top-0 left-0 isolate z-50 h-dvh w-screen bg-black/10 duration-100 data-closed:animate-out data-open:animate-in supports-backdrop-filter:backdrop-blur-xs",
        className
      )}
      data-slot="dialog-overlay"
      {...props}
    />
  );
}

/** Holds the document scroll lock for exactly as long as it is mounted. */
function ScrollLock() {
  useScrollLock();
  return null;
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean;
}) {
  return (
    <DialogPortal>
      {/*
        Inside the portal, not in DialogContent's own body: DialogContent is
        rendered by its parent whether the dialog is open or not, so a lock
        taken there would engage on first mount and never lift. DialogPortal
        defaults to keepMounted={false}, so anything in here mounts exactly
        when the dialog opens and unmounts when it closes — which makes the
        effect cleanup the release, however the dialog was dismissed.
      */}
      <ScrollLock />
      <DialogOverlay />
      <DialogPrimitive.Popup
        className={cn(
          // Viewport units for the same reason as the backdrop: `max-w-
          // [calc(100%-2rem)]` measured the overflowing content, not the
          // screen, which made the popup 511px wide and centred it on the
          // document — 139px of it hung off the right of a 375px phone.
          "data-open:fade-in-0 data-open:zoom-in-95 data-closed:fade-out-0 data-closed:zoom-out-95 fixed top-[50dvh] left-[50vw] z-50 grid w-screen max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-popover-foreground text-sm outline-none ring-1 ring-foreground/10 duration-100 data-closed:animate-out data-open:animate-in sm:max-w-sm",
          className
        )}
        data-slot="dialog-content"
        {...props}
      >
        {children}
        {showCloseButton ? (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={
              <Button
                className="absolute top-2 right-2"
                size="icon-sm"
                variant="ghost"
              />
            }
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-2", className)}
      data-slot="dialog-header"
      {...props}
    />
  );
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean;
}) {
  return (
    <div
      className={cn(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
        className
      )}
      data-slot="dialog-footer"
      {...props}
    >
      {children}
      {showCloseButton ? (
        <DialogPrimitive.Close render={<Button variant="outline" />}>
          Close
        </DialogPrimitive.Close>
      ) : null}
    </div>
  );
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      className={cn(
        "font-heading font-medium text-base leading-none",
        className
      )}
      data-slot="dialog-title"
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      className={cn(
        "text-muted-foreground text-sm *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      data-slot="dialog-description"
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
