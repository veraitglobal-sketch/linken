import Link from "next/link";
import { HomeIntegrationsMarquee } from "@/components/marketing/home-integrations-marquee";
import { HomeSection } from "@/components/marketing/home-section";

/**
 * Integrations — the page's one saturated banner.
 *
 * Thrivea breaks its long light run with a single tinted call-to-action card;
 * this is ours, in the brand's own green at its lightest usable strength. The
 * logos sit on a white tray so their brand colours never touch the tint.
 * Only ships what Hansala actually wires today.
 */
export function HomeIntegrations() {
  return (
    <HomeSection className="!py-6 sm:!py-10">
      <div className="grad-mint relative mx-auto grid max-w-6xl items-center gap-8 overflow-hidden rounded-hero p-7 sm:p-10 lg:grid-cols-[1fr_1fr] lg:gap-12 lg:p-12">
        {/* Concentric rings off the right edge — the confirmation spreading. */}
        <span aria-hidden className="pointer-events-none absolute top-1/2 -right-40 size-[520px] -translate-y-1/2 rounded-full border border-white/40" />
        <span aria-hidden className="pointer-events-none absolute top-1/2 -right-20 size-[360px] -translate-y-1/2 rounded-full border border-white/50" />
        <div className="relative">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-navy uppercase">
            Integrations
          </p>
          <h2 className="reveal mt-4 max-w-[18ch] font-display text-[clamp(1.7rem,2.9vw,2.35rem)] leading-[1.06] font-medium tracking-[-0.04em] text-ink text-balance">
            The same record, in the tools you already use.
          </h2>
          <p className="mt-4 max-w-[46ch] text-[14.5px] leading-relaxed text-ink-soft">
            Bookings via Calendly or Cal.com on your profile. Alerts in your
            Slack — partnership requests can be accepted from the channel. Drive
            the same record from Cursor, Claude, or Codex over MCP.
          </p>
          <Link
            href="/dashboard/integrations"
            className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-navy px-6 text-[13.5px] font-semibold text-on-navy transition-colors duration-200 hover:bg-navy-deep"
          >
            <span aria-hidden>→</span>
            Open integrations
          </Link>
        </div>

        <div className="relative rounded-card bg-surface px-6 py-8 shadow-[0_24px_50px_-28px_rgba(8,20,18,0.45)] sm:px-9 sm:py-10">
          <HomeIntegrationsMarquee className="grid-cols-2 sm:grid-cols-3 sm:gap-x-10" />
        </div>
      </div>
    </HomeSection>
  );
}
