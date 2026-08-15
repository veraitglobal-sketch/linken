import type { WebhookEnvelope } from "@/features/webhooks/types";

/** Slack Incoming Webhook hosts we auto-format for. */
export function isSlackIncomingWebhookUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname === "hooks.slack.com" &&
      parsed.pathname.startsWith("/services/")
    );
  } catch {
    return false;
  }
}

function str(data: Record<string, unknown>, key: string): string {
  const v = data[key];
  return typeof v === "string" && v.trim() ? v.trim() : "";
}

/** Human line for Slack Incoming Webhooks (`text` field). */
export function slackTextFromEnvelope(envelope: WebhookEnvelope): string {
  const d = envelope.data;
  if (d.test === true) {
    return `*Hansala test* — \`${envelope.type}\` reached Slack.`;
  }
  switch (envelope.type) {
    case "inquiry.created": {
      const who = str(d, "sender_name") || str(d, "sender_email") || "Someone";
      const co = str(d, "sender_company");
      const interest = str(d, "service_interest");
      const bits = [
        `*New inquiry* from ${who}${co ? ` (${co})` : ""}`,
        interest ? `Interest: ${interest}` : "",
      ].filter(Boolean);
      return bits.join("\n");
    }
    case "partnership.accepted":
      return "*Partnership confirmed* — both sides accepted.";
    case "reference.confirmed": {
      const client = str(d, "client_name") || "A client";
      const service = str(d, "service");
      return `*Reference confirmed* — ${client}${service ? ` · ${service}` : ""}`;
    }
    case "booking.connected": {
      const provider = str(d, "provider") || "booking";
      return `*Booking connected* — ${provider} link saved on your profile.`;
    }
    default:
      return `*Hansala* — ${envelope.type}`;
  }
}

/** JSON body Slack Incoming Webhooks accept. */
export function formatSlackWebhookBody(envelope: WebhookEnvelope): string {
  const text = slackTextFromEnvelope(envelope);
  return JSON.stringify({
    text,
    blocks: [
      {
        type: "section",
        text: { type: "mrkdwn", text },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `\`${envelope.type}\` · ${envelope.id}`,
          },
        ],
      },
    ],
  });
}
