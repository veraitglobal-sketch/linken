"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/cn";

export const HANSALA_MCP_URL = "https://www.hansala.com/api/mcp";

type Client = "claude" | "cursor" | "code";

function CopyField({ value, label, mono = true }: { value: string; label: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-stretch gap-2">
      <code
        className={cn(
          "min-w-0 flex-1 overflow-x-auto rounded-xl bg-[#fafbf9] px-3.5 py-2.5 text-[13px] whitespace-pre text-ink ring-1 ring-line",
          !mono && "font-sans",
        )}
      >
        {value}
      </code>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
          } catch {
            /* clipboard blocked — the text is selectable */
          }
        }}
        aria-label={`Copy ${label}`}
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 self-start rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition-colors",
          copied ? "bg-lime text-navy" : "bg-navy text-on-navy hover:bg-navy-deep",
        )}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

/**
 * Connect Hansala to Claude or Cursor with one link. Without a key the
 * connector gets the public tools (verify a company, pull confirmed proof,
 * widget snippets); with an API key it can also manage this company.
 */
export function McpConnectCard({ hasApiAccess }: { hasApiAccess: boolean }) {
  const [client, setClient] = useState<Client>("claude");
  const cursorJson = `{
  "mcpServers": {
    "hansala": {
      "url": "${HANSALA_MCP_URL}",
      "headers": { "Authorization": "Bearer hs_…" }
    }
  }
}`;
  const codeCmd = `claude mcp add --transport http hansala ${HANSALA_MCP_URL} \\
  --header "Authorization: Bearer hs_…"`;

  return (
    <section className="rounded-2xl bg-surface p-5 ring-1 ring-line/80 sm:p-6">
      <div className="flex flex-wrap items-start gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-navy text-lime">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="18" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="18" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.8" />
            <path d="M8.7 10.7 15.8 7M8.7 13.3l7.1 3.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[16px] font-semibold text-ink">Claude & Cursor connector</p>
          <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-muted">
            Paste one link and your AI assistant can look up any company&apos;s confirmed record.
            Add your API key and it can also manage this company — partners, case studies,
            widgets, verification.
          </p>
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-[12px] font-semibold tracking-[0.1em] text-muted uppercase">Connector link</p>
        <CopyField value={HANSALA_MCP_URL} label="connector link" />
      </div>

      <div className="mt-6 flex gap-1 rounded-xl bg-mute p-1" role="tablist">
        {(
          [
            ["claude", "Claude"],
            ["cursor", "Cursor"],
            ["code", "Claude Code"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={client === id}
            onClick={() => setClient(id)}
            className={cn(
              "h-9 flex-1 rounded-lg text-[13px] font-semibold transition-colors",
              client === id ? "bg-surface text-ink shadow-[0_2px_6px_-3px_rgba(14,31,28,0.3)]" : "text-ink-soft hover:text-ink",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 text-[14px] leading-relaxed text-ink-soft">
        {client === "claude" ? (
          <ol className="space-y-2.5">
            <Step n={1}>
              In Claude, open <b className="text-ink">Settings → Connectors</b>.
            </Step>
            <Step n={2}>
              Click <b className="text-ink">Add custom connector</b>, name it <b className="text-ink">Hansala</b> and
              paste the link above.
            </Step>
            <Step n={3}>
              Click <b className="text-ink">Connect</b> — sign in to Hansala, then Allow. Claude
              receives a key you can revoke any time in Dashboard → API.
            </Step>
            <li className="pl-9 text-[13px] text-muted">
              Keyless public tools (verify a company, pull confirmed proof) live at{" "}
              <code className="text-[12px] text-ink">https://www.hansala.com/api/mcp/public</code>.
            </li>
          </ol>
        ) : client === "cursor" ? (
          <div className="space-y-3">
            <ol className="space-y-2.5">
              <Step n={1}>
                In Cursor, open <b className="text-ink">Settings → MCP</b> and add a new server.
              </Step>
              <Step n={2}>Paste this, with your key in place of hs_… — or leave the header out for public tools only.</Step>
            </ol>
            <CopyField value={cursorJson} label="Cursor configuration" />
          </div>
        ) : (
          <div className="space-y-3">
            <p>Run this in your terminal, with your key in place of hs_…:</p>
            <CopyField value={codeCmd} label="Claude Code command" />
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-4 text-[13px]">
        <Link
          href="/dashboard/api"
          className="inline-flex h-9 items-center rounded-xl px-3.5 font-semibold text-ink ring-1 ring-line transition-colors hover:bg-mute"
        >
          {hasApiAccess ? "Create an API key" : "API keys (Pro)"}
        </Link>
        <Link href="/developers#agent-mcp" className="font-semibold text-ink underline-offset-2 hover:underline">
          Tool reference
        </Link>
      </div>
    </section>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-navy text-[12px] font-semibold text-lime">{n}</span>
      <span className="pt-px">{children}</span>
    </li>
  );
}
