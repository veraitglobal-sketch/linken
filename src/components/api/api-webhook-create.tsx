"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { createWebhookEndpointAction } from "@/features/webhooks/actions";
import {
  WEBHOOK_EVENT_META,
  type WebhookEventType,
} from "@/features/webhooks/types";

type Props = {
  onClose: () => void;
  onCreated: (secret: string) => void;
  onError: (message: string) => void;
};

export function ApiWebhookCreate({ onClose, onCreated, onError }: Props) {
  const [pending, startTransition] = useTransition();
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [events, setEvents] = useState<WebhookEventType[]>([
    "inquiry.created",
  ]);

  function toggle(event: WebhookEventType) {
    setEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event],
    );
  }

  function submit() {
    startTransition(async () => {
      const result = await createWebhookEndpointAction({
        url,
        description,
        events,
      });
      if (!result.ok) {
        onError(result.error);
        return;
      }
      onCreated(result.endpoint.secret ?? "");
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-5 shadow-xl">
        <h3 className="font-display text-lg font-medium tracking-[-0.03em] text-ink">
          Add webhook
        </h3>
        <label className="mt-4 block text-[12px] font-semibold text-muted">
          HTTPS URL
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://hooks.slack.com/services/… or your HTTPS URL"
            className="mt-1.5 h-10 w-full rounded-xl border border-line bg-paper px-3 text-[13px] text-ink"
          />
        </label>
        <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
          Slack Incoming Webhooks are supported — paste a{" "}
          <code className="text-ink">hooks.slack.com</code> URL and we format
          the message for Slack automatically.
        </p>
        <label className="mt-3 block text-[12px] font-semibold text-muted">
          Label (optional)
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1.5 h-10 w-full rounded-xl border border-line bg-paper px-3 text-[13px] text-ink"
          />
        </label>
        <fieldset className="mt-4">
          <legend className="text-[12px] font-semibold text-muted">Events</legend>
          <ul className="mt-2 space-y-2">
            {WEBHOOK_EVENT_META.map((ev) => (
              <li key={ev.id}>
                <label className="flex cursor-pointer items-start gap-2 text-[13px] text-ink">
                  <input
                    type="checkbox"
                    checked={events.includes(ev.id)}
                    onChange={() => toggle(ev.id)}
                    className="mt-1"
                  />
                  <span>
                    <span className="font-medium">{ev.label}</span>
                    <span className="block text-[12px] text-muted">
                      {ev.description}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="secondary" className="h-9" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            className="h-9"
            disabled={pending || !url || events.length === 0}
            onClick={submit}
          >
            Create
          </Button>
        </div>
      </div>
    </div>
  );
}
