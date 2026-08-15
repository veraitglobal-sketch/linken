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

function str(data, key) {
  const v = data[key];
  return typeof v === "string" && v.trim() ? v.trim() : "";
}

function header(data) {
  const name = str(data, "for_company_name") || "Hansala";
  return `*Hansala · ${name}*`;
}

function slackTextFromEnvelope(envelope) {
  const d = envelope.data ?? {};
  if (d.test === true) {
    return `${header(d)}\n*Test* — \`${envelope.type}\` reached this channel.`;
  }
  if (envelope.type === "partnership.requested") {
    const from = str(d, "requester_name") || "A company";
    return `${header(d)}\n*Partnership request* from ${from}`;
  }
  if (envelope.type === "partnership.requested") {
    const from = str(d, "requester_name") || "A company";
    return `${header(d)}\n*Partnership request* from ${from}`;
  }
  if (envelope.type === "partnership.accepted") {
    const a = str(d, "requester_name") || "A company";
    const b = str(d, "recipient_name") || "a company";
    return `${header(d)}\n*Partnership confirmed* — ${a} ↔ ${b}`;
  }
  if (envelope.type === "inquiry.created") {
    const who = str(d, "sender_name") || "Someone";
    const preview = str(d, "message").slice(0, 160);
    return [
      header(d),
      `*New inquiry* from ${who}`,
      preview ? `_${preview}_` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }
  if (envelope.type === "booking.connected") {
    const provider = str(d, "provider") || "booking";
    return `${header(d)}\n*Booking connected* — ${provider} link saved on your profile.`;
  }
  return `${header(d)}\n\`${envelope.type}\``;
}

test("Slack Incoming Webhook URL detection", () => {
  assert.equal(
    isSlackIncomingWebhookUrl("https://hooks.slack.com/services/T00/B00/xxx"),
    true,
  );
  assert.equal(isSlackIncomingWebhookUrl("https://example.com/hooks"), false);
});

test("Slack text for partnership names and company prefix", () => {
  const text = slackTextFromEnvelope({
    type: "partnership.accepted",
    data: {
      for_company_name: "Acme",
      requester_name: "Acme",
      recipient_name: "Beta Co",
    },
  });
  assert.match(text, /Hansala · Acme/);
  assert.match(text, /Acme ↔ Beta Co/);
});

test("Slack inquiry preview", () => {
  const text = slackTextFromEnvelope({
    type: "inquiry.created",
    data: {
      for_company_name: "Acme",
      sender_name: "Sam",
      message: "We need a quote for spring work.",
    },
  });
  assert.match(text, /New inquiry/);
  assert.match(text, /Sam/);
  assert.match(text, /quote for spring/);
});

test("Slack text for test event", () => {
  assert.match(
    slackTextFromEnvelope({
      type: "inquiry.created",
      data: { test: true, for_company_name: "Acme" },
    }),
    /Hansala · Acme/,
  );
});

test("Slack partnership request text", () => {
  assert.match(
    slackTextFromEnvelope({
      type: "partnership.requested",
      data: {
        for_company_name: "Beta",
        requester_name: "Acme",
      },
    }),
    /Partnership request/,
  );
});

test("Slack booking provider appears in text", () => {
  assert.match(
    slackTextFromEnvelope({
      type: "booking.connected",
      data: { provider: "calendly", for_company_name: "Acme" },
    }),
    /calendly/,
  );
});
