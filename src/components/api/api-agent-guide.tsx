import Link from "next/link";
import { ApiSection } from "@/components/api/api-section";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";

const STEPS = [
  { label: "Key", detail: "Create below · choose AI agent" },
  { label: "Env", detail: "HANSALA_AGENT_API_KEY" },
  { label: "Server", detail: "mcp/hansala/index.mjs" },
] as const;

export function ApiAgentGuide() {
  return (
    <ApiSection
      title="Cursor & Claude"
      description="Same hs_ key. No second secret."
      action={
        <Link
          href="/developers#agent-mcp"
          className="inline-flex h-8 items-center rounded-full border border-line bg-paper px-3 text-[11px] font-semibold text-ink transition-colors hover:bg-surface"
        >
          Setup
        </Link>
      }
    >
      <WorkspaceCard padded={false}>
        <dl className="divide-y divide-line">
          {STEPS.map((step) => (
            <div
              key={step.label}
              className="grid grid-cols-[5.5rem_1fr] items-baseline gap-3 px-5 py-3 sm:px-6"
            >
              <dt className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
                {step.label}
              </dt>
              <dd className="font-mono text-[12px] text-ink">{step.detail}</dd>
            </div>
          ))}
        </dl>
      </WorkspaceCard>
    </ApiSection>
  );
}
