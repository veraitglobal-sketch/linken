import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { AgentApiKeyRow } from "@/features/agent-api/types";

export function CreatedKeyBanner({
  value,
  copied,
  onCopy,
  onDone,
}: {
  value: string;
  copied: boolean;
  onCopy: () => void;
  onDone: () => void;
}) {
  return (
    <div className="border-b border-line bg-accent-soft px-5 py-4 sm:px-6">
      <p className="text-[12px] font-semibold text-ink">
        Copy this key now — it won&apos;t be shown again.
      </p>
      <code className="mt-2 block break-all font-mono text-[12px] text-ink">
        {value}
      </code>
      <p className="mt-2 text-[12px] text-muted">
        REST Bearer · MCP env{" "}
        <code className="text-ink">HANSALA_AGENT_API_KEY</code>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" className="h-9 px-3.5 text-[13px]" onClick={onCopy}>
          {copied ? "Copied" : "Copy key"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="h-9 px-3.5 text-[13px]"
          onClick={onDone}
        >
          Done
        </Button>
        <Link
          href="/developers#agent-mcp"
          className="inline-flex h-9 items-center rounded-full border border-line bg-surface px-3.5 text-[11px] font-semibold text-ink transition-colors hover:bg-paper"
        >
          MCP setup
        </Link>
      </div>
    </div>
  );
}

export function KeyRow({
  row,
  pending,
  onRevoke,
}: {
  row: AgentApiKeyRow;
  pending: boolean;
  onRevoke: () => void;
}) {
  return (
    <li className="grid gap-1 px-5 py-3.5 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-4 sm:px-6">
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <p className="text-[14px] font-semibold text-ink">{row.name}</p>
          <span className="font-mono text-[12px] text-ink">
            {row.key_prefix}…
          </span>
        </div>
        <p className="mt-1 text-[12px] leading-relaxed break-words text-ink">
          {row.scopes.join(" · ")}
        </p>
        <p className="mt-0.5 text-[12px] text-ink">
          {row.last_used_at
            ? `Last used ${new Date(row.last_used_at).toLocaleDateString()}`
            : "Never used"}
        </p>
      </div>
      <button
        type="button"
        onClick={onRevoke}
        disabled={pending}
        className="justify-self-start text-[12px] font-semibold text-ember underline-offset-2 hover:underline disabled:opacity-50 sm:justify-self-end"
      >
        Revoke
      </button>
    </li>
  );
}
