import Link from "next/link";
import { ApiSection } from "@/components/api/api-section";

/** Outbound webhooks stay Pro; Agent API keys and MCP do not. */
export function ApiWebhooksLock() {
  return (
    <ApiSection
      title="Webhooks"
      description="HTTPS endpoints receive signed POSTs when confirmed events happen."
    >
      <div className="rounded-2xl border border-line bg-paper/50 px-5 py-6">
        <p className="font-display text-lg font-medium tracking-[-0.03em] text-ink">
          Webhooks require Pro
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          Agent API keys and MCP stay free. Outbound event delivery to your own
          URL is a Pro feature.
        </p>
        <Link
          href="/dashboard/billing"
          className="mt-4 inline-flex h-10 items-center rounded-xl bg-ink px-4 text-[13px] font-semibold text-white"
        >
          Upgrade on Billing
        </Link>
      </div>
    </ApiSection>
  );
}
