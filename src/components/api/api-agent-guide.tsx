import Link from "next/link";
import { ApiSection } from "@/components/api/api-section";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";

export function ApiAgentGuide() {
  return (
    <ApiSection
      title="Cursor & Claude (MCP)"
      description="One Hansala API key — no separate MCP key."
    >
      <WorkspaceCard padded={false} className="space-y-4 p-5 sm:p-6">
        <dl className="grid gap-3 text-[13px] leading-relaxed text-ink-soft sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-ink">Agent API key (`lk_…`)</dt>
            <dd className="mt-1">
              Your password for{" "}
              <code className="text-[12px] text-ink">/api/v1/agent</code>. Use
              in scripts, Zapier, or any HTTP client.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-ink">MCP (Model Context Protocol)</dt>
            <dd className="mt-1">
              A bridge inside Cursor or Claude — not a second key. Paste the same{" "}
              <code className="text-[12px] text-ink">lk_…</code> into MCP config as{" "}
              <code className="text-[12px] text-ink">HANSALA_AGENT_API_KEY</code>.
            </dd>
          </div>
        </dl>

        <ol className="list-decimal space-y-1.5 pl-4 text-[13px] text-ink-soft">
          <li>
            Create key below → choose{" "}
            <span className="font-semibold text-ink">AI agent</span> (full access).
          </li>
          <li>Copy once — store in password manager or MCP env (never in chat).</li>
          <li>
            Point MCP at{" "}
            <code className="text-[12px] text-ink">mcp/hansala/index.mjs</code>{" "}
            (see developer docs).
          </li>
        </ol>

        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            href="/developers#agent-api"
            className="inline-flex h-9 items-center rounded-full border border-line bg-paper px-3.5 text-[11px] font-semibold text-ink transition-colors hover:bg-surface"
          >
            Agent API docs
          </Link>
          <Link
            href="/developers#agent-mcp"
            className="inline-flex h-9 items-center rounded-full border border-line bg-paper px-3.5 text-[11px] font-semibold text-ink transition-colors hover:bg-surface"
          >
            MCP setup
          </Link>
        </div>
      </WorkspaceCard>
    </ApiSection>
  );
}
