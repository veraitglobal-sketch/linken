import type { WebhookEnvelope } from "@/features/webhooks/types";
import { signSlackPartnershipAction } from "@/features/slack/action-token";
import { slackTextFromEnvelope } from "@/features/webhooks/slack-format";
import { getDocsSiteUrl } from "@/lib/site";

function site(): string {
  return getDocsSiteUrl().replace(/\/$/, "");
}

function str(data: Record<string, unknown>, key: string): string {
  const v = data[key];
  return typeof v === "string" && v.trim() ? v.trim() : "";
}

type Block = Record<string, unknown>;

function linkButton(label: string, path: string): Block {
  return {
    type: "button",
    text: { type: "plain_text", text: label, emoji: false },
    url: `${site()}${path}`,
  };
}

/** Block Kit for bot posts. Interactive Accept/Decline only on partnership.requested. */
export function slackBlocksFromEnvelope(envelope: WebhookEnvelope): {
  text: string;
  blocks: Block[];
} {
  const text = slackTextFromEnvelope(envelope);
  const d = envelope.data;
  const blocks: Block[] = [
    { type: "section", text: { type: "mrkdwn", text } },
  ];

  if (envelope.type === "partnership.requested" && d.test !== true) {
    const partnershipId = str(d, "partnership_id");
    const companyId = str(d, "for_company_id");
    if (partnershipId && companyId) {
      blocks.push({
        type: "actions",
        block_id: `partnership_${partnershipId}`,
        elements: [
          {
            type: "button",
            action_id: "partnership_accept",
            style: "primary",
            text: { type: "plain_text", text: "Confirm", emoji: false },
            value: signSlackPartnershipAction({
              partnershipId,
              companyId,
              decision: "accepted",
            }),
          },
          {
            type: "button",
            action_id: "partnership_decline",
            text: { type: "plain_text", text: "Decline", emoji: false },
            value: signSlackPartnershipAction({
              partnershipId,
              companyId,
              decision: "declined",
            }),
          },
          linkButton("Open on Hansala", "/dashboard/partners"),
        ],
      });
    }
  } else if (envelope.type === "inquiry.created" && d.test !== true) {
    blocks.push({
      type: "actions",
      elements: [linkButton("Open inbox", "/dashboard/inbox")],
    });
  } else if (envelope.type === "partnership.accepted" && d.test !== true) {
    blocks.push({
      type: "actions",
      elements: [linkButton("Open partners", "/dashboard/partners")],
    });
  } else if (envelope.type === "reference.confirmed" && d.test !== true) {
    blocks.push({
      type: "actions",
      elements: [linkButton("Open references", "/dashboard/references")],
    });
  }

  return { text, blocks };
}
