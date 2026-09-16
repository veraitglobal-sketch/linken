import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

function newSignupCode(n) {
  return String(n).padStart(4, "0");
}

function hashSignupCode(email, code, pepper) {
  return createHash("sha256").update(`${pepper}:${email}:${code}`).digest("hex");
}

test("signup codes are always four digits", () => {
  assert.equal(newSignupCode(7), "0007");
  assert.equal(newSignupCode(4821), "4821");
  assert.equal(newSignupCode(0), "0000");
});

test("the same email and code hash the same way", () => {
  const a = hashSignupCode("a@hansala.com", "4821", "pepper");
  const b = hashSignupCode("a@hansala.com", "4821", "pepper");
  const c = hashSignupCode("a@hansala.com", "4822", "pepper");
  assert.equal(a, b);
  assert.notEqual(a, c);
});
