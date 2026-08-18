"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ApiCreateKeyDialog } from "@/components/api/api-create-key-dialog";
import {
  CreatedKeyBanner,
  KeyRow,
} from "@/components/api/api-key-row";
import { ApiSection } from "@/components/api/api-section";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import { Button } from "@/components/ui/button";
import {
  createApiKeyAction,
  revokeApiKeyAction,
} from "@/features/agent-api/keys";
import {
  AGENT_SCOPE_PRESETS,
  type AgentApiKeyRow,
  type AgentScope,
} from "@/features/agent-api/types";

type Props = {
  keys: AgentApiKeyRow[];
};

export function ApiKeysPanel({ keys }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<AgentScope[]>([
    ...AGENT_SCOPE_PRESETS.full_access,
  ]);
  const [error, setError] = useState<string | null>(null);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const active = keys.filter((k) => !k.revoked_at);

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
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <ApiSection
      title="Keys"
      description={
        active.length === 0
          ? "Create a key, then paste it into Cursor or your agent."
          : `${active.length} active · treat like a password`
      }
      action={
        <Button
          type="button"
          className="h-9 px-3.5 text-[13px]"
          onClick={() => {
            setOpen(true);
            setError(null);
          }}
          disabled={pending}
        >
          Create key
        </Button>
      }
    >
      <WorkspaceCard padded={false}>
        {createdKey ? (
          <CreatedKeyBanner
            value={createdKey}
            copied={copied}
            onCopy={() => void copyKey()}
            onDone={() => setCreatedKey(null)}
          />
        ) : null}

        {error ? (
          <p className="border-b border-line px-5 py-3 text-[13px] text-ember sm:px-6">
            {error}
          </p>
        ) : null}

        {active.length === 0 ? (
          <div className="px-5 py-10 text-center sm:px-6">
            <p className="text-[14px] font-medium text-ink">No keys yet</p>
            <p className="mx-auto mt-1 max-w-xs text-[12px] text-muted">
              Paste it into MCP as HANSALA_AGENT_API_KEY.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {active.map((key) => (
              <KeyRow
                key={key.id}
                row={key}
                pending={pending}
                onRevoke={() => onRevoke(key.id)}
              />
            ))}
          </ul>
        )}
      </WorkspaceCard>

      {open ? (
        <ApiCreateKeyDialog
          name={name}
          onName={setName}
          scopes={scopes}
          onScopes={setScopes}
          pending={pending}
          onCancel={() => setOpen(false)}
          onCreate={onCreate}
        />
      ) : null}
    </ApiSection>
  );
}
