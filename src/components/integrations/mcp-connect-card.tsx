"use client";

import Link from "next/link";
import { useState } from "react";
import { HANSALA_MCP_URL } from "@/components/integrations/mcp-connect-snippets";
import {
  McpConnectSteps,
  type McpClient,
} from "@/components/integrations/mcp-connect-steps";
import { McpCopyField } from "@/components/integrations/mcp-copy-field";
import { cn } from "@/lib/cn";

const TABS: { id: McpClient; label: string }[] = [
  { id: "claude", label: "Claude" },
  { id: "cursor", label: "Cursor" },
  { id: "code", label: "Claude Code" },
  { id: "codex", label: "Codex" },
];

/**
 * Connect Hansala to Claude, Cursor, or Codex with one link. Without a key the
 * connector gets the public tools; with an API key it can also manage this company.
 */
export function McpConnectCard({ hasApiAccess }: { hasApiAccess: boolean }) {
  const [client, setClient] = useState<McpClient>("claude");

  return (
    <section className="rounded-2xl bg-surface p-5 ring-1 ring-line/80 sm:p-6">
      <div className="flex flex-wrap items-start gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-navy text-lime">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="18" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="18" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.8" />
            <path
              d="M8.7 10.7 15.8 7M8.7 13.3l7.1 3.7"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[16px] font-semibold text-ink">AI connector</p>
          <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-muted">
            Paste one link and your assistant can look up any company&apos;s confirmed record.
            Add your API key and it can also manage this company — partners, case studies,
            widgets, verification.
          </p>
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-[12px] font-semibold tracking-[0.1em] text-muted uppercase">
          Connector link
        </p>
        <McpCopyField value={HANSALA_MCP_URL} label="connector link" />
      </div>

      <div className="mt-6 flex flex-wrap gap-1 rounded-xl bg-mute p-1" role="tablist">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={client === id}
            onClick={() => setClient(id)}
            className={cn(
              "h-9 flex-1 rounded-lg px-2 text-[13px] font-semibold transition-colors",
              client === id
                ? "bg-surface text-ink shadow-[0_2px_6px_-3px_rgba(14,31,28,0.3)]"
                : "text-ink-soft hover:text-ink",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 text-[14px] leading-relaxed text-ink-soft">
        <McpConnectSteps client={client} />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-4 text-[13px]">
        <Link
          href="/dashboard/api"
          className="inline-flex h-9 items-center rounded-xl px-3.5 font-semibold text-ink ring-1 ring-line transition-colors hover:bg-mute"
        >
          {hasApiAccess ? "Create an API key" : "API keys (Pro)"}
        </Link>
        <Link
          href="/developers#agent-mcp"
          className="font-semibold text-ink underline-offset-2 hover:underline"
        >
          Tool reference
        </Link>
      </div>
    </section>
  );
}
