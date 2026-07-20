import Link from "next/link";
import { IntroForm } from "@/components/intros/intro-form";
import { TrustLevelBadge } from "@/components/trust/trust-level-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogoTile } from "@/components/ui/logo-tile";
import { dismissCompanyLead } from "@/features/radar-leads/actions";
import { reasonLabel } from "@/features/radar-leads/queries";
import type { RadarCompanyLead } from "@/types/radar-leads";

export function CompanyLeadRow({
  lead,
  verified,
  balance,
  introSuspended,
  index = 0,
}: {
  lead: RadarCompanyLead;
  verified: boolean;
  balance: number;
  introSuspended: boolean;
  index?: number;
}) {
  const m = lead.matched;
  let introDisabled: string | undefined;
  if (!verified) introDisabled = "Verify your domain to send intros.";
  else if (balance < 2) introDisabled = "Need 2 credits to send an intro.";
  else if (introSuspended) introDisabled = "Intro sending temporarily paused.";
  else if (!m.receiveIntros) introDisabled = "This firm is not receiving intros.";

  return (
    <li
      className="linken-widget-enter px-5 py-4 sm:px-6"
      style={{ animationDelay: `${index * 40}ms` }}
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
            <Link
              href={`/c/${m.slug}`}
              className="text-[15px] font-semibold tracking-[-0.02em] text-ink underline-offset-2 hover:underline"
            >
              {m.name}
            </Link>
            {m.verified ? <Badge tone="success">Verified</Badge> : null}
            {m.trustLevel === "Member" ? (
              <Badge>Member</Badge>
            ) : (
              <TrustLevelBadge level={m.trustLevel} />
            )}
          </div>
          <p className="mt-0.5 text-[13px] text-muted">
            {[m.category, m.city || m.country].filter(Boolean).join(" · ")}
          </p>
          <p className="mt-1.5 text-[12px] font-medium text-blue">
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
              className="h-9 px-3.5 text-[12px]"
            >
              View profile
            </Button>
            <form action={dismissCompanyLead}>
              <input type="hidden" name="feed_id" value={lead.id} />
              <Button
                type="submit"
                variant="ghost"
                className="h-9 px-3.5 text-[12px]"
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
}
