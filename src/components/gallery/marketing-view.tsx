/**
 * The "Marketing" sub-view.
 *
 * Where the other sub-views prove a palette against product chrome, this one
 * proves it against the surfaces a brand actually ships: large fields of a
 * single step, two steps blended into a gradient, and type sitting straight on
 * a photograph. Those are the cases a palette fails at first — a ramp that
 * reads fine as a button row can still collapse into mud at poster size.
 *
 * Every surface here comes off the raw ramp (`--p-*`, `--s-*`, `--t-*`), which
 * does not flip with the theme, so the artwork stays as authored in dark mode.
 * Only the testimonial card is app chrome rather than artwork, so it alone
 * paints from the theme-aware tokens — `--surface-card` and the `--fw-*` inks.
 * Taking its text off the raw ramp instead would leave step 950 quote type on a
 * step-950-dark card the moment the app flips to dark.
 *
 * The photography is Unsplash, vendored into `public/marketing/` so the gallery
 * renders offline and never calls a third-party CDN on a palette change.
 */
import { useTranslate } from "@tolgee/react";
import type { CSSProperties } from "react";
import { SCALE_KEYS } from "@/lib/color/types";

/**
 * Masonry column flow, wider than the components grid because a marketing card
 * needs room for a 40px headline. Same 20px gutter as the rest of the gallery.
 */
const COLUMNS = "columns-[300px] gap-5";
const CARD =
  "mb-5 block w-full break-inside-avoid overflow-hidden rounded-[22px]";
const EYEBROW = "font-heading text-[10px] uppercase tracking-[0.14em]";
const PILL = `${EYEBROW} justify-self-start rounded-full px-2.75 py-1.25`;
const BODY = "text-pretty text-[13px] leading-[1.6]";
const PHOTO_FILL = "absolute inset-0 size-full object-cover";
/** The pill-shaped call to action on the offer card. */
const ACTION =
  "justify-self-start whitespace-nowrap rounded-full px-5 py-[11px] font-heading text-[11px] uppercase tracking-[0.12em]";

/**
 * Gradients and blend layers stay in `style` rather than arbitrary Tailwind
 * values: multi-stop colour functions escape into unreadable bracket soup.
 */
const DOT_FIELD: CSSProperties = {
  background:
    "repeating-radial-gradient(circle at 82% 108%, var(--p-300) 0 2px, transparent 2px 46px)",
};
const SCRIM: CSSProperties = {
  background:
    "linear-gradient(180deg, rgba(0,0,0,0) 34%, rgba(0,0,0,.72) 100%)",
};
const SOCIAL_SCRIM: CSSProperties = {
  background:
    "linear-gradient(180deg, rgba(0,0,0,.1) 40%, rgba(0,0,0,.6) 100%)",
};
/** Tints the photo to the primary ramp instead of covering it. */
const SOCIAL_TINT: CSSProperties = {
  background: "var(--p-700)",
  mixBlendMode: "color",
};
const STUDIO_BLEND: CSSProperties = {
  background: "linear-gradient(150deg, var(--p-600) 0%, var(--t-500) 100%)",
};
const EVENT_STRIPES: CSSProperties = {
  background:
    "repeating-linear-gradient(115deg, rgba(255,255,255,.07) 0 1px, transparent 1px 22px)",
};

function CampaignCard() {
  const { t } = useTranslate();

  return (
    <article
      className={`${CARD} relative bg-(--p-200) px-3.5 pt-3.5 pb-6.5`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-50"
        style={DOT_FIELD}
      />
      <img
        alt=""
        className="relative h-47.5 w-full rounded-2xl object-cover"
        height={600}
        loading="lazy"
        src="/marketing/campaign.jpg"
        width={900}
      />
      <div className="relative grid gap-2.5 px-2.5 pt-5">
        <span className={`${PILL} bg-white/55 text-(--p-950)`}>
          {t("gallery.mkt.campaign-tag")}
        </span>
        <h3 className="text-balance font-heading text-[30px] text-(--p-950) leading-[1.08] tracking-[-0.03em]">
          {t("gallery.mkt.campaign-title")}
        </h3>
        <p className={`${BODY} text-[13.5px] text-(--p-800)`}>
          {t("gallery.mkt.campaign-desc")}
        </p>
      </div>
    </article>
  );
}

function GradientsCard() {
  const { t } = useTranslate();

  return (
    <article className={`${CARD} relative flex h-90 items-end`}>
      <img
        alt=""
        className={PHOTO_FILL}
        height={600}
        loading="lazy"
        src="/marketing/gradients.jpg"
        width={900}
      />
      <div aria-hidden="true" className="absolute inset-0" style={SCRIM} />
      <div className="relative grid gap-2.5 p-6">
        <span className={`${PILL} bg-(--s-400) text-(--s-950)`}>
          {t("gallery.mkt.gradients-tag")}
        </span>
        <h3 className="text-balance font-heading text-[26px] text-white leading-[1.12] tracking-[-0.02em]">
          {t("gallery.mkt.gradients-title")}
        </h3>
        <p className={`${BODY} text-white/80`}>
          {t("gallery.mkt.gradients-desc")}
        </p>
      </div>
    </article>
  );
}

function StudioCard() {
  const { t } = useTranslate();

  return (
    <article
      className={`${CARD} grid content-between p-6`}
      style={STUDIO_BLEND}
    >
      <span className={`${PILL} bg-white/20 text-white`}>
        {t("gallery.mkt.studio-tag")}
      </span>
      {/* The count the copy refers to — read off the ramp, not typed in. */}
      <span className="font-mono text-[76px] text-white/90 leading-none">
        {SCALE_KEYS.length}
      </span>
      <div className="grid gap-2">
        <h3 className="text-balance font-heading text-[24px] text-white leading-[1.12] tracking-[-0.02em]">
          {t("gallery.mkt.studio-title")}
        </h3>
        <p className={`${BODY} text-white/80`}>
          {t("gallery.mkt.studio-desc")}
        </p>
      </div>
    </article>
  );
}

function LifecycleCard() {
  const { t } = useTranslate();

  return (
    <article className={`${CARD} bg-(--s-100)`}>
      <img
        alt=""
        className="h-52.5 w-full object-cover"
        height={600}
        loading="lazy"
        src="/marketing/lifecycle.jpg"
        width={900}
      />
      <div className="grid gap-3 px-6 pt-6.5 pb-7">
        <span className={`${EYEBROW} justify-self-start text-(--s-700)`}>
          {t("gallery.mkt.lifecycle-tag")}
        </span>
        <h3 className="text-balance font-heading text-[32px] text-(--s-950) leading-[1.08] tracking-[-0.03em]">
          {t("gallery.mkt.lifecycle-title")}
        </h3>
        <p className="max-w-[46ch] text-pretty text-[14px] text-(--s-800) leading-[1.62]">
          {t("gallery.mkt.lifecycle-desc")}
        </p>
      </div>
    </article>
  );
}

function ProductCard() {
  const { t } = useTranslate();

  return (
    <article className={`${CARD} grid content-start bg-(--t-100)`}>
      <div className="grid gap-2.5 px-5.5 pt-6.5 pb-5">
        <span className={`${EYEBROW} justify-self-start text-(--t-700)`}>
          {t("gallery.mkt.product-tag")}
        </span>
        <h3 className="text-balance font-heading text-[27px] text-(--t-950) leading-[1.1] tracking-[-0.03em]">
          {t("gallery.mkt.product-title")}
        </h3>
        <p className={`${BODY} text-(--t-800)`}>
          {t("gallery.mkt.product-desc")}
        </p>
      </div>
      <img
        alt=""
        className="h-37.5 w-full object-cover"
        height={601}
        loading="lazy"
        src="/marketing/product.jpg"
        width={900}
      />
    </article>
  );
}

function SocialCard() {
  const { t } = useTranslate();

  return (
    <article className={`${CARD} relative flex h-75 items-end`}>
      <img
        alt=""
        className={PHOTO_FILL}
        height={599}
        loading="lazy"
        src="/marketing/social.jpg"
        width={900}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={SOCIAL_TINT}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={SOCIAL_SCRIM}
      />
      <div className="relative grid gap-2 p-6">
        <span className="font-mono text-[11px] text-white/75 uppercase tracking-[0.14em]">
          {t("gallery.mkt.social-tag")}
        </span>
        <h3 className="text-balance font-heading text-[25px] text-white leading-[1.12] tracking-[-0.02em]">
          {t("gallery.mkt.social-title")}
        </h3>
        <p className={`${BODY} text-white/75`}>
          {t("gallery.mkt.social-desc")}
        </p>
      </div>
    </article>
  );
}

function EventCard() {
  const { t } = useTranslate();

  return (
    <article
      className={`${CARD} relative grid content-between gap-5 bg-(--p-950) px-6 py-7`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={EVENT_STRIPES}
      />
      <span
        className={`${EYEBROW} relative justify-self-start text-(--t-300)`}
      >
        {t("gallery.mkt.event-tag")}
      </span>
      <div className="relative grid gap-3">
        <h3 className="text-balance font-heading text-[28px] text-white leading-[1.1] tracking-[-0.03em]">
          {t("gallery.mkt.event-title")}
        </h3>
        <span className="h-1 w-17 rounded-full bg-(--s-400)" />
        <p className={`${BODY} text-(--p-200)`}>
          {t("gallery.mkt.event-desc")}
        </p>
      </div>
    </article>
  );
}

function OfferCard() {
  const { t } = useTranslate();

  return (
    <article
      className={`${CARD} grid content-center gap-1.5 bg-(--s-400) px-5.5 py-6.5`}
    >
      <span className={`${EYEBROW} text-(--s-950) opacity-70`}>
        {t("gallery.mkt.offer-tag")}
      </span>
      <h3 className="text-balance font-heading text-[40px] text-(--s-950) leading-[1.02] tracking-[-0.04em]">
        {t("gallery.mkt.offer-title")}
      </h3>
      <p className={`${BODY} mt-1.5 text-(--s-950) opacity-75`}>
        {t("gallery.mkt.offer-desc")}
      </p>
      <span
        className={`${ACTION} mt-3.5 bg-(--s-950) text-(--s-100)`}
      >
        {t("gallery.newsletter.subscribe")}
      </span>
    </article>
  );
}

function TestimonialCard() {
  const { t } = useTranslate();

  return (
    <article
      className={`${CARD} grid content-between gap-4.5 border border-(--border-subtle) bg-(--surface-card) px-6 py-6.5`}
    >
      <blockquote className="text-pretty font-heading text-[22px] text-(--fw-card-title) leading-[1.24] tracking-[-0.02em]">
        “{t("gallery.mkt.testimonial-title")}”
      </blockquote>
      <div className="grid grid-cols-[44px_1fr] items-center gap-3">
        <img
          alt=""
          className="size-11 rounded-full object-cover"
          height={300}
          loading="lazy"
          src="/marketing/portrait.jpg"
          width={200}
        />
        <span className="grid gap-0.5">
          <span className="text-[13px] text-(--fw-card-desc)">
            {t("gallery.mkt.testimonial-desc")}
          </span>
          <span className={`${EYEBROW} text-(--fw-accent-ink)`}>
            {t("gallery.mkt.testimonial-tag")}
          </span>
        </span>
      </div>
    </article>
  );
}

export function MarketingView() {
  const { t } = useTranslate();

  return (
    <>
      <div className={COLUMNS}>
        <CampaignCard />
        <GradientsCard />
        <StudioCard />
        <LifecycleCard />
        <ProductCard />
        <SocialCard />
        <EventCard />
        <OfferCard />
        <TestimonialCard />
      </div>
      <p className="text-[12.5px] text-(--text-muted)">
        {t("gallery.mkt.note")}
      </p>
    </>
  );
}
