import Link from "next/link";
import { IntegrationCard } from "@/components/integrations/integration-card";
import type { IntegrationMarkName } from "@/components/integrations/integration-mark";
import { SchedulingLinkForm } from "@/components/integrations/scheduling-link-form";
import { SlackConnectButton } from "@/components/integrations/slack-connect-button";
import { disconnectScheduling } from "@/features/scheduling/actions";
import { calcomOAuthConfigured } from "@/features/scheduling/calcom-oauth";
import { calendlyOAuthConfigured } from "@/features/scheduling/calendly-oauth";
import {
  providerLabel,
  type CompanyScheduling,
  type SchedulingProvider,
} from "@/features/scheduling/types";
import { slackOAuthConfigured } from "@/features/slack/oauth";
import type { CompanySlackPublic } from "@/features/slack/queries";

/**
 * Every connectable thing in one row.
 *
 * Scheduling is deliberately two cards rather than one "Scheduling" section
 * with two buttons inside it: from the outside Calendly and Cal.com are two
 * different products a person is choosing between, and hiding that choice one
 * level down is what made the old page read as a wall of prose.
 *
 * They remain mutually exclusive, because `scheduling.provider` is singular —
 * so the unconnected one says why it cannot be picked instead of offering a
 * button that would silently replace the other.
 */

const CONNECT_CLASS =
  "inline-flex h-10 w-full items-center justify-center rounded-xl bg-navy px-4 text-[12.5px] font-semibold text-on-navy transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

type Props = {
  companyName: string;
  slack: CompanySlackPublic | null;
  scheduling: CompanyScheduling;
};

export function IntegrationsGrid({ companyName, slack, scheduling }: Props) {
  const slackReady = slackOAuthConfigured();
  const connectedProvider =
    scheduling.provider && scheduling.url ? scheduling.provider : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <IntegrationCard
          mark="slack"
          name="Slack"
          purpose="A message when a partner, project or testimonial is confirmed."
          connected={Boolean(slack)}
          detail={
            slack ? (
              <>
                {slack.teamName}
                {slack.channelName ? ` · #${slack.channelName}` : null}
              </>
            ) : null
          }
          blockedReason={
            !slackReady && !slack
              ? "Slack Connect is not configured on this environment yet."
              : undefined
          }
          action={
            slack ? (
              <SlackConnectButton mode="disconnect" />
            ) : (
              <SlackConnectButton mode="connect" />
            )
          }
        />

        <SchedulingCard
          mark="calendly"
          name="Calendly"
          provider="calendly"
          startHref="/api/integrations/calendly/start"
          ready={calendlyOAuthConfigured()}
          connectedProvider={connectedProvider}
          scheduling={scheduling}
        />

        <SchedulingCard
          mark="calcom"
          name="Cal.com"
          provider="calcom"
          startHref="/api/integrations/calcom/start"
          ready={calcomOAuthConfigured()}
          connectedProvider={connectedProvider}
          scheduling={scheduling}
        />
      </div>

      {/* The escape hatch, kept: OAuth needs credentials this environment may
          not have, and a public booking link always works. */}
      <SchedulingLinkForm scheduling={scheduling} />

      <p className="text-[12px] leading-relaxed text-muted">
        Alerts and bookings apply to{" "}
        <span className="font-semibold text-ink">{companyName}</span> — the
        active company. Switch companies in the workspace switcher first if you
        manage more than one.
      </p>
    </div>
  );
}

function SchedulingCard({
  mark,
  name,
  provider,
  startHref,
  ready,
  connectedProvider,
  scheduling,
}: {
  mark: IntegrationMarkName;
  name: string;
  provider: SchedulingProvider;
  startHref: string;
  ready: boolean;
  connectedProvider: SchedulingProvider | null;
  scheduling: CompanyScheduling;
}) {
  const isConnected = connectedProvider === provider;
  /* Narrowed to the value, not a boolean — the label below needs the provider
     itself, and a separate flag hides the narrowing from the compiler. */
  const otherConnected =
    connectedProvider && connectedProvider !== provider ? connectedProvider : null;

  return (
    <IntegrationCard
      mark={mark}
      name={name}
      purpose="Visitors book a call from your profile. Hansala does not host the calendar."
      connected={isConnected}
      detail={
        isConnected && scheduling.url ? (
          <a
            href={scheduling.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block truncate text-blue underline-offset-2 hover:underline"
          >
            {scheduling.url}
          </a>
        ) : null
      }
      blockedReason={
        otherConnected
          ? `Disconnect ${providerLabel(otherConnected)} first — one booking tool at a time.`
          : !ready
            ? `${name} is not configured on this environment. Paste a public booking link below instead.`
            : undefined
      }
      action={
        isConnected ? (
          <form action={disconnectScheduling}>
            <button
              type="submit"
              className="h-10 w-full rounded-xl border border-line text-[12.5px] font-semibold text-ink transition-colors hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Disconnect
            </button>
          </form>
        ) : (
          <Link href={startHref} className={CONNECT_CLASS}>
            Connect
          </Link>
        )
      }
    />
  );
}
