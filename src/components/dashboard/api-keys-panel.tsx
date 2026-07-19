"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createApiKeyAction,
  revokeApiKeyAction,
} from "@/features/agent-api/keys";
import {
  AGENT_SCOPE_PRESETS,
  type AgentApiKeyRow,
  type AgentScope,
} from "@/features/agent-api/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const SCOPE_META: {
  id: AgentScope;
  label: string;
  description: string;
}[] = [
  {
    id: "read",
    label: "Read",
    description: "Company, references, partnerships, inquiries, analytics, audit.",
  },
  {
    id: "content:write",
    label: "Content write",
    description: "References, case studies, logo, profile fields, partner tags.",
  },
  {
    id: "invites:send",
    label: "Invites",
    description: "Send confirmation / claim invites — cannot confirm anything.",
  },
  {
    id: "team:manage",
    label: "Team",
    description: "Invite and remove teammates (they accept via /join).",
  },
  {
    id: "structure:manage",
    label: "Structure",
    description: "Groups, subsidiaries, hierarchy proposals.",
  },
  {
    id: "settings:write",
    label: "Settings",
    description: "Widget settings, logo-wall exclusions, accepting clients.",
  },
  {
    id: "inquiries:manage",
    label: "Inquiries",
    description: "Update inquiry status (read / replied / archived).",
  },
  {
    id: "verification:run",
    label: "Verification",
    description: "Read verify instructions and run domain / backlink checks.",
  },
];

const PRESETS: {
  id: keyof typeof AGENT_SCOPE_PRESETS;
  label: string;
  description: string;
}[] = [
  {
    id: "read_only",
    label: "Read only",
    description: "read — inspect your graph and content.",
  },
  {
    id: "content_manager",
    label: "Content manager",
    description: "read + content:write + invites:send",
  },
  {
    id: "full_access",
    label: "Full access",
    description: "All scopes — full owner parity except confirmations.",
  },
];

type Props = {
  keys: AgentApiKeyRow[];
};

export function ApiKeysPanel({ keys }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<AgentScope[]>([
    ...AGENT_SCOPE_PRESETS.content_manager,
  ]);
  const [error, setError] = useState<string | null>(null);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function toggleScope(scope: AgentScope) {
    setScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope],
    );
  }

  function onCreate() {
    setError(null);
    startTransition(async () => {
      const result = await createApiKeyAction({ name, scopes });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setCreatedKey(result.key);
      setOpen(false);
      setName("");
      router.refresh();
    });
  }

  function onRevoke(id: string) {
    if (!confirm("Revoke this key immediately? Agents using it will fail.")) {
      return;
    }
    startTransition(async () => {
      const result = await revokeApiKeyAction(id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  async function copyKey() {
    if (!createdKey) return;
    await navigator.clipboard.writeText(createdKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      {createdKey ? (
        <div className="rounded-2xl border border-[#1f6b5c]/35 bg-[#1f6b5c]/08 px-4 py-4">
          <p className="text-[12px] font-semibold tracking-[0.1em] text-[#1f6b5c] uppercase">
            Store it now
          </p>
          <p className="mt-1 text-[13px] text-ink">
            We only keep a hash. This full key is shown once.
          </p>
          <code className="mt-3 block break-all rounded-xl bg-white px-3 py-2.5 font-mono text-[13px] text-ink">
            {createdKey}
          </code>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              className="h-9 px-3 text-[13px]"
              onClick={() => void copyKey()}
            >
              {copied ? "Copied" : "Copy key"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="h-9 px-3 text-[13px]"
              onClick={() => setCreatedKey(null)}
            >
              Done
            </Button>
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] text-[#64748b]">
          {keys.length === 0
            ? "No keys yet."
            : `${keys.length} key${keys.length === 1 ? "" : "s"}`}
        </p>
        <Button
          type="button"
          className="h-9 px-3 text-[13px]"
          onClick={() => {
            setOpen(true);
            setError(null);
          }}
          disabled={pending}
        >
          Create key
        </Button>
      </div>

      {error ? (
        <p className="text-[13px] text-[#b45309]">{error}</p>
      ) : null}

      <ul className="divide-y divide-[#e2e8f0] rounded-2xl border border-[#e2e8f0] bg-white">
        {keys.map((key) => {
          const revoked = Boolean(key.revoked_at);
          return (
            <li
              key={key.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5"
            >
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-ink">{key.name}</p>
                <p className="mt-0.5 font-mono text-[12px] text-[#64748b]">
                  {key.key_prefix}…
                </p>
                <p className="mt-1 text-[12px] text-[#94a3b8]">
                  {key.scopes.join(" · ")}
                  {" · "}
                  created {new Date(key.created_at).toLocaleDateString()}
                  {key.last_used_at
                    ? ` · last used ${new Date(key.last_used_at).toLocaleString()}`
                    : " · never used"}
                  {revoked ? " · revoked" : ""}
                </p>
              </div>
              {!revoked ? (
                <button
                  type="button"
                  onClick={() => onRevoke(key.id)}
                  disabled={pending}
                  className="text-[12px] font-semibold text-[#b45309] underline-offset-2 hover:underline disabled:opacity-50"
                >
                  Revoke
                </button>
              ) : (
                <span className="text-[12px] font-medium text-[#94a3b8]">
                  Revoked
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center">
          <div
            role="dialog"
            aria-labelledby="create-key-title"
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-xl"
          >
            <h2
              id="create-key-title"
              className="font-display text-xl font-medium tracking-[-0.03em] text-ink"
            >
              Create API key
            </h2>
            <label className="mt-4 block">
              <span className="text-[12px] font-semibold text-[#64748b]">
                Name
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Viktor AI production"
                className="mt-1 w-full rounded-xl border border-[#e2e8f0] px-3 py-2.5 text-[14px] text-ink outline-none focus:border-[#10231f]"
              />
            </label>

            <div className="mt-4">
              <p className="text-[12px] font-semibold text-[#64748b]">Presets</p>
              <div className="mt-2 flex flex-col gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() =>
                      setScopes([...AGENT_SCOPE_PRESETS[preset.id]])
                    }
                    className="rounded-xl border border-[#e2e8f0] px-3 py-2.5 text-left transition-colors hover:border-[#10231f] hover:bg-[#f8fafc]"
                  >
                    <span className="block text-[13px] font-semibold text-ink">
                      {preset.label}
                    </span>
                    <span className="mt-0.5 block text-[12px] text-[#64748b]">
                      {preset.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <fieldset className="mt-4 space-y-2">
              <legend className="text-[12px] font-semibold text-[#64748b]">
                Scopes
              </legend>
              {SCOPE_META.map((scope) => (
                <label
                  key={scope.id}
                  className={cn(
                    "flex cursor-pointer gap-3 rounded-xl border px-3 py-2.5",
                    scopes.includes(scope.id)
                      ? "border-[#10231f] bg-[#f8fafc]"
                      : "border-[#e2e8f0]",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={scopes.includes(scope.id)}
                    onChange={() => toggleScope(scope.id)}
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-[13px] font-semibold text-ink">
                      {scope.label}
                    </span>
                    <span className="mt-0.5 block text-[12px] text-[#64748b]">
                      {scope.description}
                    </span>
                  </span>
                </label>
              ))}
            </fieldset>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                className="h-9 px-3 text-[13px]"
                onClick={() => setOpen(false)}
                disabled={pending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="h-9 px-3 text-[13px]"
                onClick={onCreate}
                disabled={pending || !name.trim() || scopes.length === 0}
              >
                {pending ? "Creating…" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
