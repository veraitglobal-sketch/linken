"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ApiWebhookCreate } from "@/components/api/api-webhook-create";
import { ApiWebhookDeliveries } from "@/components/api/api-webhook-deliveries";
import { ApiWebhookRow } from "@/components/api/api-webhook-row";
import { ApiSection } from "@/components/api/api-section";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import { Button } from "@/components/ui/button";
import {
  deleteWebhookEndpointAction,
  sendTestWebhookAction,
  updateWebhookEndpointAction,
} from "@/features/webhooks/actions";
import type {
  WebhookDeliveryRow,
  WebhookEndpointPublic,
} from "@/features/webhooks/types";

type Props = {
  endpoints: WebhookEndpointPublic[];
  deliveries: WebhookDeliveryRow[];
};

export function ApiWebhooksPanel({ endpoints, deliveries }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);

  function refresh() {
    router.refresh();
  }

  function onToggle(id: string, active: boolean) {
    setError(null);
    startTransition(async () => {
      const result = await updateWebhookEndpointAction({ id, active });
      if (!result.ok) setError(result.error);
      else refresh();
    });
  }

  function onDelete(id: string) {
    if (!confirm("Delete this webhook endpoint?")) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteWebhookEndpointAction(id);
      if (!result.ok) setError(result.error);
      else refresh();
    });
  }

  function onTest(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await sendTestWebhookAction(id);
      if (!result.ok) setError(result.error);
      else refresh();
    });
  }

  return (
    <ApiSection
      title="Webhooks"
      description="HTTPS endpoints receive signed POSTs when confirmed events happen. Slack Incoming Webhook URLs are auto-formatted. Secret is shown once."
      action={
        <Button
          type="button"
          variant="secondary"
          className="h-9 px-3 text-[12px]"
          disabled={pending}
          onClick={() => setOpen(true)}
        >
          Add endpoint
        </Button>
      }
    >
      {error ? (
        <p className="mb-3 text-[13px] text-ember">{error}</p>
      ) : null}
      {createdSecret ? (
        <WorkspaceCard className="mb-4 border-[#1a5c51]/25 bg-[#1a5c51]/5 px-4 py-3">
          <p className="text-[12px] font-semibold text-ink">Signing secret (copy now)</p>
          <code className="mt-1 block break-all text-[12px] text-ink-soft">
            {createdSecret}
          </code>
          <button
            type="button"
            className="mt-2 text-[12px] font-semibold text-ink underline-offset-2 hover:underline"
            onClick={() => setCreatedSecret(null)}
          >
            Dismiss
          </button>
        </WorkspaceCard>
      ) : null}
      <WorkspaceCard className="divide-y divide-line overflow-hidden p-0">
        {endpoints.length === 0 ? (
          <p className="px-5 py-8 text-center text-[13px] text-muted">
            No endpoints yet. Add an HTTPS URL to receive events.
          </p>
        ) : (
          endpoints.map((ep) => (
            <ApiWebhookRow
              key={ep.id}
              endpoint={ep}
              pending={pending}
              onToggle={onToggle}
              onDelete={onDelete}
              onTest={onTest}
            />
          ))
        )}
      </WorkspaceCard>
      <ApiWebhookDeliveries rows={deliveries} />
      {open ? (
        <ApiWebhookCreate
          onClose={() => setOpen(false)}
          onCreated={(secret) => {
            setCreatedSecret(secret);
            setOpen(false);
            refresh();
          }}
          onError={setError}
        />
      ) : null}
    </ApiSection>
  );
}
