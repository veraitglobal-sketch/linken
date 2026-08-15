import { handleSlackInteraction } from "@/features/slack/handle-interaction";
import { verifySlackSignature } from "@/features/slack/verify-signature";

export async function POST(request: Request) {
  const signingSecret = process.env.SLACK_SIGNING_SECRET?.trim() ?? "";
  const rawBody = await request.text();
  const ok = verifySlackSignature({
    signingSecret,
    signature: request.headers.get("x-slack-signature"),
    timestamp: request.headers.get("x-slack-request-timestamp"),
    rawBody,
  });
  if (!ok) {
    return new Response("invalid signature", { status: 401 });
  }

  const params = new URLSearchParams(rawBody);
  const payloadRaw = params.get("payload");
  if (!payloadRaw) {
    return new Response("missing payload", { status: 400 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(payloadRaw);
  } catch {
    return new Response("bad payload", { status: 400 });
  }

  return handleSlackInteraction(
    payload as Parameters<typeof handleSlackInteraction>[0],
  );
}
