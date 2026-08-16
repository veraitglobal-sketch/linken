import type { WebhookEnvelope } from "@/features/webhooks/types";
import { getDocsSiteUrl } from "@/lib/site";

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

function site(): string {
  return getDocsSiteUrl().replace(/\/$/, "");
}

function header(data: Record<string, unknown>): string {
  const name = str(data, "for_company_name") || "Hansala";
  return `*Hansala · ${name}*`;
}

function linkLine(label: string, path: string): string {
  return `<${site()}${path}|${label}>`;
}

/** Human line for Slack Incoming Webhooks (`text` field). */
export function slackTextFromEnvelope(envelope: WebhookEnvelope): string {
  const d = envelope.data;
  if (d.test === true) {
    return `${header(d)}\n*Test* — \`${envelope.type}\` reached this channel.`;
  }
  switch (envelope.type) {
    case "inquiry.created": {
      const who = str(d, "sender_name") || str(d, "sender_email") || "Someone";
      const co = str(d, "sender_company");
      const interest = str(d, "service_interest");
      const preview = str(d, "message").slice(0, 160);
      const slug = str(d, "company_slug");
      const lines = [
        header(d),
        `*New inquiry* from ${who}${co ? ` (${co})` : ""}`,
        interest ? `Interest: ${interest}` : "",
        preview ? `_${preview}${str(d, "message").length > 160 ? "…" : ""}_` : "",
        slug
          ? linkLine("Open inbox", "/dashboard/inbox")
          : linkLine("Open workspace", "/dashboard"),
      ];
      return lines.filter(Boolean).join("\n");
    }
    case "partnership.requested": {
      const from = str(d, "requester_name") || "A company";
      const domain = str(d, "requester_domain");
      const website = str(d, "requester_website");
      const city = str(d, "requester_city");
      const country = str(d, "requester_country");
      const place = [city, country].filter(Boolean).join(", ");
      const contact = str(d, "requester_contact_name");
      const email = str(d, "requester_contact_email");
      const slug = str(d, "requester_slug");
      const verified = d.requester_verified === true;
      return [
        header(d),
        `*Partnership request* from ${from}${verified ? " · domain verified" : ""}`,
        domain ? `Domain: ${domain}` : "",
        website && website !== domain ? `Website: ${website}` : "",
        place ? `Location: ${place}` : "",
        contact ? `Contact: ${contact}` : "",
        email ? `Email: ${email}` : "",
        slug ? linkLine("View profile", `/c/${slug}`) : "",
        linkLine("Open partners", "/dashboard/partners"),
      ]
        .filter(Boolean)
        .join("\n");
    }
    case "partnership.accepted": {
      const a = str(d, "requester_name") || "A company";
      const b = str(d, "recipient_name") || "a company";
      const slug = str(d, "for_company_slug");
      return [
        header(d),
        `*Partnership confirmed* — ${a} ↔ ${b}`,
        slug
          ? linkLine("View profile", `/c/${slug}`)
          : "",
        linkLine("Open partners", "/dashboard/partners"),
      ]
        .filter(Boolean)
        .join("\n");
    }
    case "reference.confirmed": {
      const client = str(d, "client_name") || "A client";
      const service = str(d, "service");
      const slug = str(d, "for_company_slug");
      return [
        header(d),
        `*Reference confirmed* — ${client}${service ? ` · ${service}` : ""}`,
        slug
          ? linkLine("View profile", `/c/${slug}`)
          : "",
        linkLine("Open references", "/dashboard/references"),
      ]
        .filter(Boolean)
        .join("\n");
    }
    case "booking.connected": {
      const provider = str(d, "provider") || "booking";
      const slug = str(d, "company_slug");
      return [
        header(d),
        `*Booking connected* — ${provider} link saved on your profile.`,
        slug
          ? linkLine("View profile", `/c/${slug}`)
          : linkLine("Open integrations", "/dashboard/integrations"),
      ].join("\n");
    }
    default:
      return `${header(d)}\n\`${envelope.type}\``;
  }
}

/** JSON body Slack Incoming Webhooks accept. */
export function formatSlackWebhookBody(envelope: WebhookEnvelope): string {
  const text = slackTextFromEnvelope(envelope);
  const d = envelope.data;
  const name = str(d, "for_company_name");
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
            text: name
              ? `Hansala · ${name} · \`${envelope.type}\``
              : `\`${envelope.type}\` · ${envelope.id}`,
          },
        ],
      },
    ],
  });
}
