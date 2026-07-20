"use client";

import {
  AGENT_SCOPE_PRESETS,
  type AgentScope,
} from "@/features/agent-api/types";
import { KEY_PRESETS, SCOPE_META } from "@/components/api/api-scope-meta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";

type Props = {
  name: string;
  onName: (v: string) => void;
  scopes: AgentScope[];
  onScopes: (v: AgentScope[]) => void;
  pending: boolean;
  onCancel: () => void;
  onCreate: () => void;
};

export function ApiCreateKeyDialog({
  name,
  onName,
  scopes,
  onScopes,
  pending,
  onCancel,
  onCreate,
}: Props) {
  function toggleScope(scope: AgentScope) {
    onScopes(
      scopes.includes(scope)
        ? scopes.filter((s) => s !== scope)
        : [...scopes, scope],
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-navy-deep/55 px-3 py-3 backdrop-blur-[2px] sm:items-center sm:px-4"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-labelledby="create-key-title"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-line bg-surface p-5 shadow-[0_24px_80px_rgba(10,20,18,0.28)] sm:p-6"
      >
        <p className="text-[10px] font-semibold tracking-[0.14em] text-plus uppercase">
          Agent API
        </p>
        <h2
          id="create-key-title"
          className="mt-1 font-display text-xl font-medium tracking-[-0.03em] text-ink"
        >
          Create API key
        </h2>

        <label className="mt-4 block">
          <span className="text-[12px] font-semibold text-muted">Name</span>
          <Input
            value={name}
            onChange={(e) => onName(e.target.value)}
            placeholder="Viktor AI production"
            className="mt-1.5"
          />
        </label>

        <div className="mt-4">
          <p className="text-[12px] font-semibold text-muted">Presets</p>
          <div className="mt-2 flex flex-col gap-2">
            {KEY_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onScopes([...AGENT_SCOPE_PRESETS[preset.id]])}
                className="rounded-xl border border-line px-3 py-2.5 text-left transition-colors hover:border-navy hover:bg-paper/70"
              >
                <span className="block text-[13px] font-semibold text-ink">
                  {preset.label}
                </span>
                <span className="mt-0.5 block text-[12px] text-muted">
                  {preset.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        <fieldset className="mt-4 space-y-2">
          <legend className="text-[12px] font-semibold text-muted">Scopes</legend>
          {SCOPE_META.map((scope) => (
            <label
              key={scope.id}
              className={cn(
                "flex cursor-pointer gap-3 rounded-xl border px-3 py-2.5",
                scopes.includes(scope.id)
                  ? "border-navy bg-paper/70"
                  : "border-line",
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
                <span className="mt-0.5 block text-[12px] text-muted">
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
            className="h-9 px-3.5 text-[13px]"
            onClick={onCancel}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-9 px-3.5 text-[13px]"
            onClick={onCreate}
            disabled={pending || !name.trim() || scopes.length === 0}
          >
            {pending ? "Creating…" : "Create"}
          </Button>
        </div>
      </div>
    </div>
  );
}
