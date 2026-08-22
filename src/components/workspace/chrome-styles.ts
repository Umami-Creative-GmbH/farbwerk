/**
 * The handful of class strings the workspace repeats.
 *
 * These encode the design system's own rules — eyebrows are Outfit, 11px,
 * uppercase, tracked to 0.16em; controls are pills; inputs are 44px tall with an
 * 8px radius and mono values — so a new control inherits them by name instead of
 * by copying a class list and drifting.
 */

/** Uppercase section label above a control group. */
export const SECTION_LABEL =
  "font-heading text-[11px] uppercase tracking-[0.16em] text-[var(--text-muted)]";

/** Small selectable pill — anchor steps, harmony rules, gallery sub-views. */
export const PILL =
  "cursor-pointer rounded-full border font-heading text-[11px] tracking-[0.06em] transition-[color,background-color,border-color] duration-150 ease-[var(--ease-out)]";

export const PILL_ACTIVE =
  "border-[var(--fw-active-bg)] bg-[var(--fw-active-bg)] text-[var(--fw-active-fg)]";

export const PILL_IDLE =
  "border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-body)] hover:border-[var(--border-strong)]";

/** Outline action in the toolbar: uppercase, pill, inverts on hover. */
export const ACTION_BUTTON =
  "flex h-10 cursor-pointer items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface-card)] px-[18px] font-heading text-[12px] text-[var(--text-heading)] uppercase tracking-[0.12em] transition-[color,background-color,border-color] duration-150 ease-[var(--ease-out)] hover:border-[var(--fw-active-bg)] hover:bg-[var(--fw-active-bg)] hover:text-[var(--fw-active-fg)]";

/** The single accent action per view. */
export const ACCENT_BUTTON =
  "flex h-10 cursor-pointer items-center gap-2 rounded-full border-none bg-[var(--pink-500)] px-5 font-heading text-[12px] text-white uppercase tracking-[0.12em] shadow-[var(--shadow-accent)] transition-colors duration-150 ease-[var(--ease-out)] hover:bg-[var(--pink-700)]";

/** Text field: 44px tall, 8px radius, mono value. */
export const FIELD_INPUT =
  "h-11 w-full rounded-[8px] border border-[var(--border-strong)] bg-[var(--surface-card)] px-3.5 font-mono text-[14px] text-[var(--text-heading)] outline-none focus-visible:border-[var(--blue-500)]";

/**
 * Translucent pill on the navy header — the shell shared by the language
 * picker and the theme toggle. Callers add their own size and typography.
 */
export const HEADER_CONTROL =
  "flex cursor-pointer items-center justify-center rounded-full border border-[var(--border-inverse)] bg-white/8 text-white transition-colors duration-150 ease-[var(--ease-out)] hover:bg-white/16";
