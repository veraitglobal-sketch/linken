import assert from "node:assert/strict";
import test from "node:test";

/** Mirror of src/features/webhooks/slack-format.ts for node:test. */

function isSlackIncomingWebhookUrl(url) {
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

function slackTextFromEnvelope(envelope) {
  const d = envelope.data ?? {};
  if (d.test === true) {
    return `*Hansala test* — \`${envelope.type}\` reached Slack.`;
  }
  if (envelope.type === "partnership.accepted") {
    return "*Partnership confirmed* — both sides accepted.";
  }
  if (envelope.type === "booking.connected") {
    const provider = typeof d.provider === "string" ? d.provider : "booking";
    return `*Booking connected* — ${provider} link saved on your profile.`;
  }
  return `*Hansala* — ${envelope.type}`;
}

test("Slack Incoming Webhook URL detection", () => {
  assert.equal(
    isSlackIncomingWebhookUrl("https://hooks.slack.com/services/T00/B00/xxx"),
    true,
  );
  assert.equal(isSlackIncomingWebhookUrl("https://example.com/hooks"), false);
});

test("Slack text for partnership and test", () => {
  assert.match(
    slackTextFromEnvelope({
      type: "partnership.accepted",
      data: {},
    }),
    /Partnership confirmed/,
  );
  assert.match(
    slackTextFromEnvelope({
      type: "inquiry.created",
      data: { test: true },
    }),
    /Hansala test/,
  );
});

test("Slack booking provider appears in text", () => {
  assert.match(
    slackTextFromEnvelope({
      type: "booking.connected",
      data: { provider: "calendly" },
    }),
    /calendly/,
  );
});
