import Image from "next/image";
import type { ReactNode } from "react";
import { EmbedVerifiedLockup } from "@/components/embed/embed-verified-lockup";
import { NetworkMark } from "@/components/marketing/network-mark";
import { FLOW_HUB, FLOW_TARGET } from "@/components/marketing/product-flow-data";
import {
  FREE_PLAN_PRICE,
  PRO_PLAN_PRICE,
} from "@/features/plan/pricing";
import { cn } from "@/lib/cn";

/**
 * Homepage illustrations, drawn from the product rather than photographed.
 *
 * Every vignette is assembled from things Hansala actually shows — a record
 * row, a pending or confirmed state, the lockup, a one-pager, a vendor check —
 * and only ever names the two companies the product flow already uses (Vera
 * IT and Fade). Where a line would need content that does not exist, it is a
 * neutral bar, never invented text. `example.com` is the reserved example
 * domain, so the "no file" result points at nobody.
 */

const HUB = FLOW_HUB;
const PARTNER = FLOW_TARGET;

export function Logo({
  src,
  name,
  size = 36,
  className,
}: {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-xl bg-white ring-1 ring-line",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          fill
          sizes={`${size}px`}
          className="object-contain p-1.5"
        />
      ) : (
        <span className="text-[11px] font-semibold text-ink-soft">
          {name.slice(0, 2).toUpperCase()}
        </span>
      )}
    </span>
  );
}

export function Check({ tone = "lime" }: { tone?: "lime" | "navy" }) {
  return (
    <span
      className={cn(
        "grid size-5 shrink-0 place-items-center rounded-full",
        tone === "lime" ? "bg-lime text-navy" : "bg-navy text-lime",
      )}
    >
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
        <path
          d="m2.5 6.5 2.2 2.2L9.5 3.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function Bar({ w, className }: { w: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("block h-2 rounded-full bg-ink/[0.08]", className)}
      style={{ width: w }}
    />
  );
}

function Chip({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "confirmed" | "pending" | "none";
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        tone === "confirmed" && "bg-navy text-on-navy",
        tone === "pending" &&
          "border border-dashed border-ink/30 bg-white text-ink-soft",
        tone === "none" && "bg-mute text-ink-soft",
      )}
    >
      {tone === "confirmed" ? (
        <span className="size-1.5 rounded-full bg-lime" />
      ) : null}
      {children}
    </span>
  );
}

const card =
  "rounded-2xl bg-white shadow-[0_1px_2px_rgba(14,31,28,0.05),0_18px_40px_-20px_rgba(14,31,28,0.3)] ring-1 ring-line/60";

/* ------------------------------------------------------------------------ */

/** Proposals — the printed one-pager, confirmed references listed. */
export function VignetteOnePager() {
  return (
    <div className="relative mx-auto w-full max-w-[460px] pt-2">
      <div className={cn(card, "rotate-[-2deg] p-5")}>
        <div className="flex items-center gap-3 border-b border-line pb-4">
          <Logo src={HUB.logo} name={HUB.name} size={40} />
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-ink">{HUB.name}</p>
            <p className="text-[11px] text-muted">{HUB.domain} · One-pager</p>
          </div>
          <EmbedVerifiedLockup size="sm" />
        </div>
        <p className="mt-4 text-[10px] font-semibold tracking-[0.14em] text-muted uppercase">
          Confirmed references
        </p>
        <div className="mt-2.5 flex items-center gap-3 rounded-xl bg-lime-soft px-3 py-2.5">
          <Logo src={PARTNER.logo} name={PARTNER.name} size={30} />
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-semibold text-ink">
              {PARTNER.name}
            </span>
            <span className="block text-[11px] text-ink-soft">
              Confirmed by {PARTNER.domain}
            </span>
          </span>
          <Check tone="navy" />
        </div>
        <div className="mt-3 space-y-2.5 px-1">
          <Bar w="78%" />
          <Bar w="62%" />
          <Bar w="70%" />
        </div>
      </div>
    </div>
  );
}

/** Tenders — a reference requirement answered with record states. */
export function VignetteReferences() {
  return (
    <div className="mx-auto w-full max-w-[460px] space-y-2.5 pt-2">
      <div className={cn(card, "flex items-center gap-3 px-4 py-3")}>
        <span className="grid size-8 place-items-center rounded-lg bg-navy text-lime">
          <NetworkMark size={14} animate={false} />
        </span>
        <span className="flex-1 text-[13px] font-semibold text-ink">
          Reference requirement
        </span>
        <span className="text-[11px] font-semibold text-muted">Tender</span>
      </div>
      <div className={cn(card, "flex items-center gap-3 px-4 py-3")}>
        <Logo src={PARTNER.logo} name={PARTNER.name} size={32} />
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold text-ink">
            {PARTNER.name}
          </span>
          <Bar w="70%" className="mt-1.5" />
        </span>
        <Chip tone="confirmed">Confirmed</Chip>
      </div>
      <div className="flex items-center gap-3 rounded-2xl border border-dashed border-ink/25 bg-white/70 px-4 py-3">
        <span className="size-8 rounded-lg bg-ink/[0.06]" />
        <span className="min-w-0 flex-1">
          <Bar w="45%" />
          <Bar w="65%" className="mt-1.5" />
        </span>
        <Chip tone="pending">Pending · only you</Chip>
      </div>
    </div>
  );
}

/** Sales — the public profile a prospect lands on. */
export function VignetteProfile() {
  return (
    <div className={cn(card, "mx-auto w-full max-w-[460px] overflow-hidden")}>
      <div className="h-16 bg-[linear-gradient(120deg,var(--lime),var(--lime-soft))]" />
      <div className="px-5 pb-5">
        <div className="-mt-7 flex items-end gap-3">
          <Logo
            src={HUB.logo}
            name={HUB.name}
            size={56}
            className="rounded-2xl shadow-[0_8px_20px_-10px_rgba(14,31,28,0.4)] ring-4 ring-white"
          />
          <div className="min-w-0 flex-1 pb-1">
            <p className="text-[16px] font-semibold text-ink">{HUB.name}</p>
            <p className="flex items-center gap-1.5 text-[11px] text-muted">
              <span className="size-1.5 rounded-full bg-[#7cc43f]" />
              {HUB.domain} · Domain verified
            </p>
          </div>
        </div>
        <p className="mt-5 text-[10px] font-semibold tracking-[0.14em] text-muted uppercase">
          Confirmed partners
        </p>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex items-center gap-2.5 rounded-full bg-mute py-1.5 pr-3.5 pl-1.5">
            <Logo src={PARTNER.logo} name={PARTNER.name} size={26} className="rounded-full" />
            <span className="text-[12.5px] font-semibold text-ink">
              {PARTNER.name}
            </span>
            <Check />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Procurement — a vendor check: a record, or no file. */
export function VignetteVendorCheck() {
  return (
    <div className="mx-auto w-full max-w-[460px] space-y-2.5 pt-2">
      <div className={cn(card, "px-4 py-3")}>
        <div className="flex items-center gap-2.5 rounded-full bg-mute px-3.5 py-2 text-[13px] text-ink">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          {HUB.domain}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Logo src={HUB.logo} name={HUB.name} size={32} />
          <span className="flex-1 text-[13px] font-semibold text-ink">
            {HUB.name}
          </span>
          <Chip tone="confirmed">Confirmed record</Chip>
        </div>
      </div>
      <div className={cn(card, "px-4 py-3")}>
        <div className="flex items-center gap-2.5 rounded-full bg-mute px-3.5 py-2 text-[13px] text-ink">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          example.com
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[13px] text-ink-soft">No record yet</span>
          <Chip tone="none">No file</Chip>
        </div>
      </div>
    </div>
  );
}

/** A customer's own site with the embed on it. */
export function VignetteSiteEmbed() {
  return (
    <div className={cn(card, "w-full overflow-hidden")}>
      <div className="flex items-center gap-2 border-b border-line px-3 py-2.5">
        <span className="flex gap-1">
          <span className="size-2 rounded-full bg-line" />
          <span className="size-2 rounded-full bg-line" />
          <span className="size-2 rounded-full bg-line" />
        </span>
        <span className="flex-1 truncate rounded-full bg-mute px-3 py-1 text-[11px] text-muted">
          your-company.com
        </span>
      </div>
      <div className="space-y-3 p-4">
        <Bar w="55%" className="h-3 bg-ink/15" />
        <Bar w="80%" />
        <div className="flex items-center justify-between gap-3 rounded-xl bg-mute px-3 py-2.5">
          <EmbedVerifiedLockup size="sm" />
          <span className="flex items-center gap-1.5">
            <Logo src={PARTNER.logo} name={PARTNER.name} size={24} className="rounded-md" />
            <Logo src={HUB.logo} name={HUB.name} size={24} className="rounded-md" />
          </span>
        </div>
      </div>
    </div>
  );
}

/** Two companies and the link between them, on navy. */
export function VignetteConnection({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative grid aspect-[5/4] w-full place-items-center overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_50%_45%,#1d3a33,var(--navy-deep)_70%)]",
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(205,239,132,0.35) 1px, transparent 1.2px)",
          backgroundSize: "22px 22px",
        }}
      />
      <svg
        viewBox="0 0 500 400"
        className="absolute inset-0 h-full w-full"
        aria-hidden
        fill="none"
      >
        <path d="M150 250 C 230 250, 260 150, 350 150" stroke="var(--lime)" strokeWidth="10" strokeLinecap="round" opacity="0.25" />
        <path id="vc-link" d="M150 250 C 230 250, 260 150, 350 150" stroke="var(--lime)" strokeWidth="3" strokeLinecap="round" />
        <circle r="5" fill="var(--lime)" className="motion-reduce:hidden">
          <animateMotion dur="2.6s" repeatCount="indefinite" path="M150 250 C 230 250, 260 150, 350 150" />
        </circle>
      </svg>
      <div className="absolute top-[52%] left-[8%] flex items-center gap-3 rounded-2xl bg-white px-3.5 py-3 shadow-[0_20px_40px_-16px_rgba(0,0,0,0.6)] sm:left-[10%]">
        <Logo src={HUB.logo} name={HUB.name} size={40} />
        <span>
          <span className="block text-[14px] font-semibold text-ink">{HUB.name}</span>
          <span className="block text-[10px] font-semibold tracking-[0.14em] text-muted uppercase">
            Company
          </span>
        </span>
      </div>
      <div className="absolute top-[26%] right-[8%] flex items-center gap-3 rounded-2xl bg-white px-3.5 py-3 shadow-[0_20px_40px_-16px_rgba(0,0,0,0.6)] sm:right-[10%]">
        <Logo src={PARTNER.logo} name={PARTNER.name} size={40} />
        <span>
          <span className="block text-[14px] font-semibold text-ink">{PARTNER.name}</span>
          <span className="block text-[10px] font-semibold tracking-[0.14em] text-muted uppercase">
            Partner
          </span>
        </span>
        <span className="absolute -top-2 -right-2">
          <Check />
        </span>
      </div>
    </div>
  );
}

/** The confirmation the other side receives. */
export function VignetteConfirm() {
  return (
    <div className={cn(card, "w-full max-w-[380px] p-5")}>
      <div className="flex items-center gap-3">
        <Logo src={HUB.logo} name={HUB.name} size={40} />
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-ink">
            {HUB.name} added you
          </p>
          <p className="text-[12px] text-muted">as a partner on Hansala</p>
        </div>
      </div>
      <p className="mt-4 text-[13px] leading-relaxed text-ink-soft">
        Nothing is public until you confirm.
      </p>
      <div className="mt-4 flex gap-2">
        <span className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-navy text-[13px] font-semibold text-on-navy">
          <span className="size-1.5 rounded-full bg-lime" />
          Confirm
        </span>
        <span className="inline-flex h-10 items-center justify-center rounded-full border border-line px-4 text-[13px] font-semibold text-ink">
          Not now
        </span>
      </div>
    </div>
  );
}

/** Free and Pro, side by side, on navy. */
export function VignettePlans() {
  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      <div className="rotate-[-3deg] rounded-3xl bg-white p-6 shadow-[0_30px_60px_-24px_rgba(0,0,0,0.6)]">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
          Free
        </p>
        <p className="mt-2 font-display text-[40px] leading-none font-semibold tracking-[-0.04em] text-ink">
          {FREE_PLAN_PRICE}
        </p>
        <ul className="mt-5 space-y-2.5">
          {["Company profile", "Domain verification", "Every mutual confirmation"].map((t) => (
            <li key={t} className="flex items-center gap-2.5 text-[13.5px] text-ink">
              <Check />
              {t}
            </li>
          ))}
        </ul>
      </div>
      <div className="relative -mt-10 ml-auto w-[78%] rotate-[3deg] rounded-3xl bg-lime p-6 shadow-[0_30px_60px_-24px_rgba(0,0,0,0.6)]">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-navy/70 uppercase">
          Pro
        </p>
        <p className="mt-2 font-display text-[32px] leading-none font-semibold tracking-[-0.04em] text-navy">
          {PRO_PLAN_PRICE}
        </p>
        <p className="mt-3 text-[13.5px] leading-snug text-navy">
          Testimonials and partner logos on your own site.
        </p>
      </div>
    </div>
  );
}

/** Banner art — the lockup over a confirmed record, on lime. */
export function VignetteBadgeStack() {
  return (
    <div className="relative h-full min-h-[240px] w-full">
      <div className={cn(card, "absolute top-[18%] right-[10%] left-[8%] rotate-[4deg] px-4 py-3.5")}>
        <div className="flex items-center gap-3">
          <Logo src={PARTNER.logo} name={PARTNER.name} size={34} />
          <span className="flex-1 text-[13px] font-semibold text-ink">
            {PARTNER.name}
          </span>
          <Chip tone="confirmed">Confirmed</Chip>
        </div>
      </div>
      <div className="absolute top-[48%] left-[14%] rotate-[-5deg] rounded-2xl bg-white px-5 py-4 shadow-[0_24px_48px_-18px_rgba(14,31,28,0.45)]">
        <EmbedVerifiedLockup size="lg" />
      </div>
    </div>
  );
}
