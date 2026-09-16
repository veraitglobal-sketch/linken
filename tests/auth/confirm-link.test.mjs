import assert from "node:assert/strict";
import test from "node:test";

/** Keep in sync with src/features/auth/confirm-link.ts */
function signupConfirmUrl(origin, tokenHash, type, next) {
  const q = new URLSearchParams({
    token_hash: tokenHash,
    type,
    next,
  });
  return `${origin.replace(/\/$/, "")}/auth/confirm?${q.toString()}`;
}

test("signup confirm URL carries hashed token, type and next", () => {
  const url = signupConfirmUrl(
    "https://hansala.com",
    "abc+token",
    "signup",
    "/onboarding",
  );
  const parsed = new URL(url);
  assert.equal(parsed.origin, "https://hansala.com");
  assert.equal(parsed.pathname, "/auth/confirm");
  assert.equal(parsed.searchParams.get("token_hash"), "abc+token");
  assert.equal(parsed.searchParams.get("type"), "signup");
  assert.equal(parsed.searchParams.get("next"), "/onboarding");
});
