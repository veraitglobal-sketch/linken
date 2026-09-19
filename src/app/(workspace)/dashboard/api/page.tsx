import type { Metadata } from "next";
import Link from "next/link";
import { ApiAgentGuide } from "@/components/api/api-agent-guide";
import { McpConnectCard } from "@/components/integrations/mcp-connect-card";
import { ApiAuditList } from "@/components/api/api-audit-list";
import { ApiKeysPanel } from "@/components/api/api-keys-panel";
import { ApiWebhooksLock } from "@/components/api/api-webhooks-lock";
import { ApiWebhooksPanel } from "@/components/api/api-webhooks-panel";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
import { SwitchCompanyNotice } from "@/components/dashboard/switch-company-notice";
import { listApiKeys, listRecentAudit } from "@/features/agent-api/keys";
import {
  listWebhookDeliveries,
  listWebhookEndpoints,
} from "@/features/webhooks/actions";
import { isPaidPlan } from "@/features/plan/entitlements";
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

  const paid = isPaidPlan(company.plan);
  const [keys, audit, endpoints, deliveries] = await Promise.all([
    listApiKeys(),
    listRecentAudit(50),
    paid ? listWebhookEndpoints() : Promise.resolve([]),
    paid ? listWebhookDeliveries(30) : Promise.resolve([]),
  ]);

  return (
    <WorkspacePage
      title="API"
      description="Keys act as your company."
      wide
      stats={[
        { label: "Keys", value: keys.length },
        { label: "Webhooks", value: endpoints.length },
        { label: "Recent calls", value: audit.length },
      ]}
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
        <McpConnectCard />
        <ApiAgentGuide />
        <ApiKeysPanel keys={keys} />
        {paid ? (
          <ApiWebhooksPanel endpoints={endpoints} deliveries={deliveries} />
        ) : (
          <ApiWebhooksLock />
        )}
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
