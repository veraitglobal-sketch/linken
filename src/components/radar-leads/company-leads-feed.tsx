import Link from "next/link";
import { IntroForm } from "@/components/intros/intro-form";
import { TrustLevelBadge } from "@/components/trust/trust-level-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogoTile } from "@/components/ui/logo-tile";
import {
  dismissCompanyLead,
} from "@/features/radar-leads/actions";
import { reasonLabel } from "@/features/radar-leads/queries";
import type { RadarCompanyLead } from "@/types/radar-leads";

type Props = {
  leads: RadarCompanyLead[];
  searchesCount: number;
  radarEnabled: boolean;
  verified: boolean;
  balance: number;
  /** Computed on the server — avoid Date.now in render. */
  introSuspended: boolean;
};

export function CompanyLeadsFeed({
  leads,
  searchesCount,
  radarEnabled,
  verified,
  balance,
  introSuspended,
}: Props) {
  if (!radarEnabled) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-[11px] font-semibold tracking-[0.14em] text-[#94a3b8] uppercase">
          Company leads
        </h2>
        <p className="mt-1 text-[13px] text-ink-soft">
          Firms matching your saved searches. Contact only via intro (2 credits).
        </p>
      </div>

      {searchesCount === 0 ? (
        <div className="rounded-xl border border-line bg-paper px-5 py-6">
          <p className="font-display text-lg font-medium tracking-[-0.03em] text-ink">
            Define what you&apos;re looking for
          </p>
          <p className="mt-1 text-[14px] text-ink-soft">
            Save a search below — Radar fills your feed when matching firms appear.
          </p>
          <a
            href="#saved-searches"
            className="mt-3 inline-flex text-[13px] font-semibold text-ink underline"
          >
            Create a saved search
          </a>
        </div>
      ) : leads.length === 0 ? (
        <p className="rounded-xl border border-line bg-paper px-5 py-5 text-[14px] text-ink-soft">
          We&apos;ll notify you when a matching company appears.
        </p>
      ) : (
        <ul className="space-y-3">
          {leads.map((lead) => {
            const m = lead.matched;
            let introDisabled: string | undefined;
            if (!verified) introDisabled = "Verify your domain to send intros.";
            else if (balance < 2) introDisabled = "Need 2 credits to send an intro.";
            else if (introSuspended) {
              introDisabled = "Intro sending temporarily paused.";
            }
            else if (!m.receiveIntros) {
              introDisabled = "This firm is not receiving intros.";
            }

            return (
              <li
                key={lead.id}
                className="rounded-xl border border-line bg-paper px-4 py-4"
              >
                <div className="flex flex-wrap items-start gap-3">
                  <LogoTile
                    name={m.name}
                    initials={m.logoInitials}
                    logoUrl={m.logoUrl}
                    website={m.website}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-[1.05rem] font-medium tracking-[-0.03em] text-ink">
                        {m.name}
                      </p>
                      {m.verified ? <Badge tone="success">Verified</Badge> : null}
                      {m.trustLevel === "Member" ? (
                        <Badge>Member</Badge>
                      ) : (
                        <TrustLevelBadge level={m.trustLevel} />
                      )}
                    </div>
                    <p className="mt-0.5 text-[13px] text-ink-soft">
                      {[m.category, m.city || m.country].filter(Boolean).join(" · ")}
                    </p>
                    <p className="mt-1.5 text-[12px] font-medium text-[#1f6b5c]">
                      {reasonLabel(lead.reason)}
                      {lead.searchName ? (
                        <span className="font-normal text-muted">
                          {" "}
                          · {lead.searchName}
                        </span>
                      ) : null}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Button
                        href={`/c/${m.slug}`}
                        variant="secondary"
                        className="h-9 px-3 text-[12px]"
                      >
                        View profile
                      </Button>
                      <form action={dismissCompanyLead}>
                        <input type="hidden" name="feed_id" value={lead.id} />
                        <Button
                          type="submit"
                          variant="ghost"
                          className="h-9 px-3 text-[12px]"
                        >
                          Dismiss
                        </Button>
                      </form>
                    </div>

                    <IntroForm
                      recipientCompanyId={m.id}
                      recipientName={m.name}
                      disabledReason={introDisabled}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {searchesCount > 0 && leads.length > 0 ? (
        <p className="text-[12px] text-muted">
          Ranked by freshness. Never paid placement.{" "}
          <Link href="/dashboard/inbox?tab=intros" className="underline">
            Intros inbox
          </Link>
        </p>
      ) : null}
    </section>
  );
}
