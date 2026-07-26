"use client";

import type { WebhookEndpointPublic } from "@/features/webhooks/types";

type Props = {
  endpoint: WebhookEndpointPublic;
  pending: boolean;
  onToggle: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
  onTest: (id: string) => void;
};

export function ApiWebhookRow({
  endpoint,
  pending,
  onToggle,
  onDelete,
  onTest,
}: Props) {
  return (
    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="truncate font-mono text-[13px] text-ink">{endpoint.url}</p>
        {endpoint.description ? (
          <p className="mt-0.5 text-[12px] text-muted">{endpoint.description}</p>
        ) : null}
        <p className="mt-1.5 text-[11px] text-muted">
          {endpoint.events.join(" · ")}
          {" · "}
          <span className={endpoint.active ? "text-[#1a5c51]" : "text-ember"}>
            {endpoint.active ? "Active" : "Paused"}
          </span>
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => onTest(endpoint.id)}
          className="rounded-lg border border-line px-2.5 py-1.5 text-[11px] font-semibold text-ink hover:bg-paper"
        >
          Test
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => onToggle(endpoint.id, !endpoint.active)}
          className="rounded-lg border border-line px-2.5 py-1.5 text-[11px] font-semibold text-ink hover:bg-paper"
        >
          {endpoint.active ? "Pause" : "Resume"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => onDelete(endpoint.id)}
          className="rounded-lg border border-line px-2.5 py-1.5 text-[11px] font-semibold text-ember hover:bg-paper"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
