import "server-only";

import { respondPartnershipFromSlack } from "@/features/slack/partnership-from-slack";

type SlackPayload = {
  type?: string;
  team?: { id?: string };
  user?: { id?: string };
  actions?: { action_id?: string; value?: string }[];
  response_url?: string;
};

/** Handle Slack block_actions for partnership Accept/Decline. */
export async function handleSlackInteraction(
  payload: SlackPayload,
): Promise<Response> {
  if (payload.type !== "block_actions") {
    return new Response("", { status: 200 });
  }

  const action = payload.actions?.[0];
  const actionId = action?.action_id ?? "";
  if (
    actionId !== "partnership_accept" &&
    actionId !== "partnership_decline"
  ) {
    return new Response("", { status: 200 });
  }

  const result = await respondPartnershipFromSlack({
    actionValue: action?.value ?? "",
    slackUserId: payload.user?.id ?? "",
    slackTeamId: payload.team?.id ?? "",
  });

  const body = {
    replace_original: true,
    text: result.message,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: result.ok
            ? `*Hansala* — ${result.message}`
            : `*Hansala* — ${result.message}`,
        },
      },
    ],
  };

  if (payload.response_url) {
    try {
      await fetch(payload.response_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch {
      /* ignore */
    }
  }

  return Response.json(body);
}
