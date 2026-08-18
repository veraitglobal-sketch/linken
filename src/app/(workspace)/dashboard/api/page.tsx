import type { Metadata } from "next";
import Link from "next/link";
import { ApiAgentGuide } from "@/components/api/api-agent-guide";
import { ApiAuditList } from "@/components/api/api-audit-list";
import { ApiKeysPanel } from "@/components/api/api-keys-panel";
import { ApiWebhooksPanel } from "@/components/api/api-webhooks-panel";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
import { SwitchCompanyNotice } from "@/components/dashboard/switch-company-notice";
import { listApiKeys, listRecentAudit } from "@/features/agent-api/keys";
import {
  listWebhookDeliveries,
  listWebhookEndpoints,
} from "@/features/webhooks/actions";
import { getEntitlements } from "@/features/plan/entitlements";
import { assertCompanySection } from "@/features/workspace/company-gate";

export const metadata: Metadata = {
  title: "API",
};

export default async function DashboardApiPage() {
  const { user, company, needsCompanySwitch } =
    await assertCompanySection("api");

  if (needsCompanySwitch) {
    return <SwitchCompanyNotice title="API" />;
  }

  if (!user) {
    return (
      <WorkspacePage title="API" description="Keys act as your company.">
        <p className="text-[14px] text-muted">
          <Link
            href="/login?next=/dashboard/api"
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            Sign in
          </Link>{" "}
          to manage Agent API keys.
        </p>
      </WorkspacePage>
    );
  }

  if (!company) {
    return (
      <WorkspacePage title="API" description="Keys act as your company.">
        <p className="text-[14px] text-muted">
          <Link
            href="/onboarding"
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            Create your company
          </Link>{" "}
          first.
        </p>
      </WorkspacePage>
    );
  }

  const canAgentApi = getEntitlements(company.plan).agentApi;

  if (!canAgentApi) {
    return (
      <WorkspacePage
        title="API"
        description="Keys act as your company."
      >
        <div className="rounded-2xl border border-line bg-paper/50 px-5 py-8 text-center">
          <p className="font-display text-xl font-medium tracking-[-0.03em] text-ink">
            Agent API is Pro
          </p>
          <p className="mx-auto mt-2 max-w-md text-[13px] text-muted">
            Keys and MCP after you upgrade.
          </p>
          <Link
            href="/dashboard/billing"
            className="mt-5 inline-flex h-10 items-center rounded-xl bg-ink px-4 text-[13px] font-semibold text-white"
          >
            Upgrade on Billing
          </Link>
        </div>
      </WorkspacePage>
    );
  }

  const [keys, audit, endpoints, deliveries] = await Promise.all([
    listApiKeys(),
    listRecentAudit(50),
    listWebhookEndpoints(),
    listWebhookDeliveries(30),
  ]);

  return (
    <WorkspacePage
      title="API"
      description="Keys act as your company."
      action={
        <Link
          href="/developers#agent-api"
          className="inline-flex h-9 items-center rounded-full border border-line bg-surface px-3.5 text-[11px] font-semibold text-ink transition-colors hover:bg-paper"
        >
          Docs
        </Link>
      }
    >
      <div className="space-y-10">
        <ApiAgentGuide />
        <ApiKeysPanel keys={keys} />
        <ApiWebhooksPanel endpoints={endpoints} deliveries={deliveries} />
        <ApiAuditList
          rows={audit.map((row) => ({
            id: row.id as string | number,
            action: (row.action as string | null) ?? null,
            status: (row.status as string | number | null) ?? null,
            summary: (row.summary as string | null) ?? null,
            path: (row.path as string | null) ?? null,
            created_at: String(row.created_at),
          }))}
        />
      </div>
    </WorkspacePage>
  );
}
