import Link from "next/link";
import { SlackConnectButton } from "@/components/integrations/slack-connect-button";
import { slackOAuthConfigured } from "@/features/slack/oauth";
import type { CompanySlackPublic } from "@/features/slack/queries";

type Props = {
  slack: CompanySlackPublic | null;
};

/** Customer connects their own Slack workspace via Hansala's Slack app. */
export function SlackIntegrations({ slack }: Props) {
  const ready = slackOAuthConfigured();
  const channel = slack?.channelName
    ? `#${slack.channelName}`
    : "a channel";

  return (
    <section className="rounded-2xl border border-line bg-surface px-5 py-5">
      <p className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
        Slack
      </p>
      <h2 className="mt-1 font-display text-xl font-medium tracking-[-0.03em] text-ink">
        Activity in your workspace
      </h2>
      <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-muted">
        Alerts for <span className="font-semibold text-ink">this</span> company
        profile only — same as Calendly Connect. Partnership requests can be
        confirmed or declined from Slack (by the person who connected). Alerts
        include company, domain, and contact when available.
      </p>
      {slack ? (
        <p className="mt-2 text-[12px] text-muted">
          Already connected before action buttons? Disconnect and Connect again
          so Slack grants <span className="font-semibold text-ink">chat:write</span>.
        </p>
      ) : null}

      {slack ? (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-ink">
            Connected to <span className="font-semibold">{slack.teamName}</span>
            {" · "}
            <span className="font-semibold">{channel}</span>
          </p>
          <SlackConnectButton mode="disconnect" />
        </div>
      ) : (
        <div className="mt-5">
          {ready ? (
            <SlackConnectButton mode="connect" />
          ) : (
            <p className="text-[12px] text-muted">
              Slack Connect is not configured on this environment yet.{" "}
              <Link
                href="/developers/webhooks"
                className="font-semibold text-ink underline-offset-2 hover:underline"
              >
                Webhooks docs
              </Link>
            </p>
          )}
        </div>
      )}
    </section>
  );
}
