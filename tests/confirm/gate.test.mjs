import assert from "node:assert/strict";
import test from "node:test";

function confirmResponderGate(input) {
  if (!input.userId) return "auth";
  if (input.companyId && input.companyId === input.senderCompanyId) {
    return "sender";
  }
  return "ok";
}

function suggestedConfirmCompanyName(clientName, email) {
  const named = String(clientName ?? "").trim();
  if (named) return named;
  const local = String(email ?? "")
    .split("@")[0]
    ?.replace(/[._+-]+/g, " ")
    .trim();
  return local || "Company";
}

function confirmRpcMessage(raw) {
  if (/not authenticated/i.test(raw)) {
    return "Sign in again, then open this confirmation link.";
  }
  if (/not company owner/i.test(raw)) {
    return "Only the company owner can confirm this request.";
  }
  if (/expired/i.test(raw)) {
    return "This confirmation link has expired.";
  }
  if (/already resolved|not found/i.test(raw)) {
    return "This request is no longer pending. Open the original email link, or ask them to send a new invite.";
  }
  return raw.trim() || "Could not respond.";
}

function parseConfirmToken(raw) {
  const token = String(raw ?? "").trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    token,
  )
    ? token
    : null;
}

test("sender cannot confirm their own request", () => {
  assert.equal(
    confirmResponderGate({
      userId: "u1",
      companyId: "provider",
      senderCompanyId: "provider",
    }),
    "sender",
  );
});

test("logged-in client can confirm even without a company yet", () => {
  assert.equal(
    confirmResponderGate({
      userId: "u1",
      companyId: null,
      senderCompanyId: "provider",
    }),
    "ok",
  );
});

test("invite inbox is not a gate", () => {
  assert.equal(
    confirmResponderGate({
      userId: "u1",
      companyId: "client",
      senderCompanyId: "provider",
    }),
    "ok",
  );
});

test("anonymous visitors must sign in", () => {
  assert.equal(
    confirmResponderGate({
      userId: null,
      companyId: null,
      senderCompanyId: "provider",
    }),
    "auth",
  );
});

test("suggested name prefers the client firm, then the email local part", () => {
  assert.equal(suggestedConfirmCompanyName("Acme GmbH", "x@y.com"), "Acme GmbH");
  assert.equal(suggestedConfirmCompanyName("", "jane.doe@acme.com"), "jane doe");
});

test("RPC errors stay factual", () => {
  assert.match(confirmRpcMessage("Not authenticated"), /Sign in again/);
  assert.match(confirmRpcMessage("Request not found or already resolved"), /no longer pending/);
  assert.equal(confirmRpcMessage("Invalid decision"), "Invalid decision");
});

test("confirm tokens are UUIDs", () => {
  assert.equal(
    parseConfirmToken("3fa85f64-5717-4562-b3fc-2c963f66afa6"),
    "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  );
  assert.equal(parseConfirmToken("not-a-token"), null);
});
