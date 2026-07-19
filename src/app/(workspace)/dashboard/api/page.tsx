import type { Metadata } from "next";
import Link from "next/link";
import { ApiKeysPanel } from "@/components/dashboard/api-keys-panel";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
import { listApiKeys, listRecentAudit } from "@/features/agent-api/keys";
import { getDashboardSession } from "@/features/dashboard/session";

export const metadata: Metadata = {
  title: "API",
};

export default async function DashboardApiPage() {
  const { user, company } = await getDashboardSession();

  if (!user) {
    return (
      <WorkspacePage title="API" description="Keys and agent activity.">
        <p className="text-sm text-[#64748b]">
          <Link
            href="/login?next=/dashboard/api"
            className="font-semibold underline"
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
      <WorkspacePage title="API" description="Keys and agent activity.">
        <p className="text-sm text-[#64748b]">
          <Link href="/onboarding" className="font-semibold underline">
            Create your company
          </Link>{" "}
          first.
        </p>
      </WorkspacePage>
    );
  }

  const [keys, audit] = await Promise.all([listApiKeys(), listRecentAudit(50)]);

  return (
    <WorkspacePage
      title="API"
      description="Agent keys act as your company. Confirmations stay human."
    >
      <div className="mx-auto max-w-3xl space-y-10">
        <div className="rounded-2xl border border-[#e2e8f0] bg-[#fafbfc] px-4 py-4 text-[13px] leading-relaxed text-[#475569]">
          Keys act as your company. Anyone with a key can edit content and send
          invites in your name. Confirmations always require a human on the
          other side — no key can confirm anything.
        </div>

        <section>
          <h2 className="text-[11px] font-semibold tracking-[0.12em] text-[#94a3b8] uppercase">
            API keys
          </h2>
          <div className="mt-3">
            <ApiKeysPanel keys={keys} />
          </div>
          <p className="mt-3 text-[13px] text-[#64748b]">
            Full docs:{" "}
            <Link
              href="/developers#agent-api"
              className="font-semibold text-ink underline-offset-2 hover:underline"
            >
              Developers → Agent API
            </Link>
          </p>
        </section>

        <section>
          <h2 className="text-[11px] font-semibold tracking-[0.12em] text-[#94a3b8] uppercase">
            Agent activity
          </h2>
          <p className="mt-1 text-[13px] text-[#64748b]">
            Last 50 audited calls — everything an agent did in your name.
          </p>
          <div className="mt-3 overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white">
            {audit.length === 0 ? (
              <p className="px-4 py-6 text-[13px] text-[#94a3b8]">
                No agent activity yet.
              </p>
            ) : (
              <ul className="divide-y divide-[#e2e8f0]">
                {audit.map((row) => (
                  <li
                    key={String(row.id)}
                    className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-ink">
                        {String(row.action)}
                        <span className="ml-2 font-normal text-[#94a3b8]">
                          {String(row.status)}
                        </span>
                      </p>
                      <p className="mt-0.5 truncate text-[12px] text-[#64748b]">
                        {String(row.summary || row.path)}
                      </p>
                    </div>
                    <time className="shrink-0 text-[11px] tabular-nums text-[#94a3b8]">
                      {new Date(String(row.created_at)).toLocaleString()}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </WorkspacePage>
  );
}
