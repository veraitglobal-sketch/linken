import { SchedulingLinkForm } from "@/components/integrations/scheduling-link-form";
import { SchedulingStatus } from "@/components/integrations/scheduling-status";
import type { CompanyScheduling } from "@/features/scheduling/types";
import {
  calcomOAuthConfigured,
} from "@/features/scheduling/calcom-oauth";
import {
  calendlyOAuthConfigured,
} from "@/features/scheduling/calendly-oauth";

type Props = {
  scheduling: CompanyScheduling;
};

export function SchedulingIntegrations({ scheduling }: Props) {
  const connected = Boolean(scheduling.provider && scheduling.url);
  const calendlyReady = calendlyOAuthConfigured();
  const calcomReady = calcomOAuthConfigured();

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-line bg-surface px-5 py-5">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
          Scheduling
        </p>
        <h2 className="mt-1 font-display text-xl font-medium tracking-[-0.03em] text-ink">
          Book a call on your profile
        </h2>
        <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-muted">
          Connect Calendly or Cal.com. Visitors open your booking page — Hansala
          does not host the calendar.
        </p>

        <SchedulingStatus scheduling={scheduling} connected={connected} />

        {!connected ? (
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <a
              href="/api/integrations/calendly/start"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-line bg-paper px-4 text-[13px] font-semibold text-ink transition-colors hover:bg-surface"
            >
              Connect Calendly
            </a>
            <a
              href="/api/integrations/calcom/start"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-line bg-paper px-4 text-[13px] font-semibold text-ink transition-colors hover:bg-surface"
            >
              Connect Cal.com
            </a>
          </div>
        ) : null}

        {!calendlyReady || !calcomReady ? (
          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            Calendly needs CLIENT_ID + SECRET. Cal.com needs only CLIENT_ID
            (PKCE). You can always paste a public booking link below.
          </p>
        ) : null}
      </section>

      <SchedulingLinkForm scheduling={scheduling} />
    </div>
  );
}
