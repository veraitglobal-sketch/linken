"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { OFFER_INCLUDED } from "@/features/billing/offer";

const SEEN_PRICING = "hansala_seen_pricing";
const DISMISSED = "hansala_offer_reminder_dismissed";
/** Set once a signed-in visit shows a Pro or Founding workspace. */
const HAS_PLAN = "hansala_has_paid_plan";
/** Per tab session: shown once, so it comes back from time to time, not on every page. */
const SHOWN_THIS_SESSION = "hansala_offer_shown";
/** Time on one page before the card offers itself. */
const DWELL_MS = 12_000;

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage blocked — the reminder simply does not persist */
  }
}

/** Pages where a sales card would be in the way or already redundant. */
function excluded(path: string) {
  return (
    path.startsWith("/pricing") ||
    path.startsWith("/offer") ||
    path.startsWith("/onboarding") ||
    path.startsWith("/welcome")
  );
}

/**
 * Pro already active on this account — never offer it. Signed in, the
 * session answers and is remembered; signed out (the sign-in page), the last
 * remembered answer stands, so a paying customer is not pitched on the way in.
 */
async function hasPaidPlan(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/session", { credentials: "same-origin", cache: "no-store" });
    const json = (await res.json()) as { user: { hasPaidPlan?: boolean } | null };
    if (json.user) {
      const paid = Boolean(json.user.hasPaidPlan);
      write(HAS_PLAN, paid ? "1" : "0");
      return paid;
    }
  } catch {
    /* unknown — fall back to what this browser last knew */
  }
  return read(HAS_PLAN) === "1";
}

/**
 * The introductory Pro offer as a small card, bottom right — never a modal,
 * never on the back button. It offers itself when someone opens sign-in,
 * has looked at /pricing, or has spent 12 seconds on a page — at most once
 * per browser session. Anyone whose account already has Pro or Founding never
 * sees it. Any answer — Not now, close, or See the offer — ends it for good.
 */
export function OfferReminder() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/pricing")) {
      write(SEEN_PRICING, String(Date.now()));
      return;
    }
    if (excluded(pathname)) return;
    if (read(DISMISSED)) return;
    try {
      if (window.sessionStorage.getItem(SHOWN_THIS_SESSION)) return;
    } catch {
      /* no session storage — still bounded by the dismissal above */
    }

    const soon = pathname.startsWith("/login") || Boolean(read(SEEN_PRICING));
    let cancelled = false;
    const t = window.setTimeout(
      () => {
        void hasPaidPlan().then((paid) => {
          if (cancelled || paid) return;
          try {
            window.sessionStorage.setItem(SHOWN_THIS_SESSION, "1");
          } catch {
            /* ignore */
          }
          setOpen(true);
        });
      },
      soon ? 1500 : DWELL_MS,
    );
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [pathname]);

  if (!open || excluded(pathname)) return null;

  const close = () => {
    write(DISMISSED, "1");
    setOpen(false);
  };

  return (
    <aside
      aria-label="Introductory Pro offer"
      className="animate-rise fixed right-4 bottom-4 left-4 z-50 overflow-hidden rounded-[28px] bg-surface shadow-[0_40px_80px_-24px_rgba(14,31,28,0.45)] ring-1 ring-ink/10 sm:left-auto sm:w-[380px]"
    >
      <div className="relative m-2 overflow-hidden rounded-[22px] bg-lime px-5 pt-4 pb-5 text-navy">
        <div className="relative flex items-center justify-between">
          <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-navy px-3 text-[12px] font-semibold text-lime">
            <span className="size-1.5 rounded-full bg-lime" />
            Special introductory offer
          </span>
          <button
            type="button"
            onClick={close}
            aria-label="Close offer"
            className="-mr-2 grid size-9 place-items-center rounded-full text-navy/60 transition-colors hover:bg-navy/10 hover:text-navy"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <p className="relative mt-4 text-[14px] font-semibold">Hansala Pro from</p>
        <p className="relative mt-0.5 flex items-baseline gap-1.5">
          <span className="font-display text-[36px] leading-none sm:text-[44px] font-semibold tracking-[-0.045em] tabular-nums">
            $12.42
          </span>
          <span className="text-[15px] font-semibold text-navy/70">/ month</span>
        </p>
        <div className="relative mt-3 flex flex-wrap gap-1.5 text-[12px] font-semibold">
          <span className="rounded-full bg-white/70 px-2.5 py-1">$149 / year</span>
          <span className="rounded-full bg-white/40 px-2.5 py-1">$99 / six months</span>
        </div>
      </div>

      <div className="px-3 pt-1 pb-3 sm:px-5 sm:pt-3 sm:pb-5">
        <ul className="hidden list-none space-y-2 p-0 sm:block">
          {OFFER_INCLUDED.map((item) => (
            <li key={item} className="flex items-center gap-2.5 text-[14px] text-ink">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-lime-soft text-navy">
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="m3.5 8.5 3 3 6-7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              {item}
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2 sm:mt-5">
          <Link
            href="/offer"
            onClick={close}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-navy px-5 text-[15px] font-semibold text-on-navy transition-colors hover:bg-navy-deep"
          >
            See the offer
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <button
            type="button"
            onClick={close}
            className="inline-flex h-12 items-center rounded-full px-4 text-[14px] font-semibold text-ink-soft transition-colors hover:bg-mute hover:text-ink"
          >
            Not now
          </button>
        </div>
      </div>
    </aside>
  );
}
