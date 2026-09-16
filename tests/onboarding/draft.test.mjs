import assert from "node:assert/strict";
import test from "node:test";

/** Keep in sync with src/features/company/onboarding-draft.ts */
function draftFromFormData(formData) {
  const get = (k) => String(formData.get(k) ?? "").trim();
  return {
    name: get("name"),
    organizationKind: get("organization_kind"),
    category: get("category"),
    city: get("city"),
    website: get("website"),
    description: get("description"),
    displayName: get("display_name"),
    displayTitle: get("display_title"),
    countryCode: get("country_code"),
    email: get("email"),
  };
}

/** Keep in sync with src/features/company/signup-error.ts */
function isExistingAccountError(message) {
  return /already (been )?registered|user already exists|email already/i.test(
    message,
  );
}

function signupErrorMessage(error) {
  const text = String(error.message ?? error.msg ?? "").trim();
  const mailFailed =
    /^(?:\{\}|\[object Object\])$/.test(text) ||
    /confirmation email/i.test(text) ||
    error.code === "unexpected_failure" ||
    error.name === "AuthRetryableFetchError";
  if (mailFailed) {
    return "We could not send the confirmation email. Try again in a minute.";
  }
  if (text) return text;
  return "Could not create the account. Try again.";
}

function publicAuthError(raw) {
  const text = (raw ?? "").trim();
  if (!text) return null;
  return signupErrorMessage({ message: text });
}

test("draftFromFormData keeps company fields from the last step", () => {
  const fd = new FormData();
  fd.set("name", "Example Facilities");
  fd.set("organization_kind", "company");
  fd.set("category", "Cleaning");
  fd.set("city", "Berlin");
  fd.set("website", "https://example.org");
  fd.set("description", "Facility work.");
  fd.set("display_name", "Jane Doe");
  fd.set("display_title", "CEO");
  fd.set("country_code", "DE");
  fd.set("email", "info@example.org");
  const draft = draftFromFormData(fd);
  assert.equal(draft.name, "Example Facilities");
  assert.equal(draft.category, "Cleaning");
  assert.equal(draft.countryCode, "DE");
  assert.equal(draft.email, "info@example.org");
});

test("isExistingAccountError matches Supabase copy", () => {
  assert.equal(isExistingAccountError("User already registered"), true);
  assert.equal(isExistingAccountError("Invalid login credentials"), false);
});

test("signupErrorMessage is specific when confirmation email fails", () => {
  const text = signupErrorMessage({
    message: "Error sending confirmation email",
    code: "unexpected_failure",
  });
  assert.equal(/confirmation email/i.test(text), true);
  assert.match(signupErrorMessage({ message: "{}" }), /confirmation email/i);
  assert.match(publicAuthError("{}") ?? "", /confirmation email/i);
  assert.equal(publicAuthError(""), null);
});
