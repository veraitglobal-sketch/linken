import "server-only";

type SlackApiResult = { ok: true } | { ok: false; error: string };

/** Post mrkdwn + Block Kit via bot token. */
export async function postSlackChatMessage(input: {
  botToken: string;
  channelId: string;
  text: string;
  blocks: unknown[];
}): Promise<SlackApiResult> {
  const res = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.botToken}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      channel: input.channelId,
      text: input.text,
      blocks: input.blocks,
      unfurl_links: false,
      unfurl_media: false,
    }),
  });

  if (!res.ok) return { ok: false, error: `http_${res.status}` };
  const json = (await res.json()) as { ok?: boolean; error?: string };
  if (!json.ok) return { ok: false, error: json.error || "slack_error" };
  return { ok: true };
}
