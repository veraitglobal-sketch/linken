import assert from "node:assert/strict";
import test from "node:test";

/**
 * Mirrors resolvePostLoginPath without importing server-only modules.
 */
function resolvePostLoginPath(isStaff, requestedNext) {
  const next =
    requestedNext.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : "/dashboard";
  const path = next.split("?")[0] ?? next;
  const confirmFlow =
    path === "/confirm" ||
    path.startsWith("/confirm/") ||
    path.startsWith("/confirm-reference/") ||
    path.startsWith("/claim/") ||
    path.startsWith("/join/");
  if (isStaff && !confirmFlow) return "/admin";
  if (path === "/admin" || path.startsWith("/admin/")) return "/dashboard";
  return next;
}

test("staff always land on /admin", () => {
  assert.equal(resolvePostLoginPath(true, "/dashboard"), "/admin");
  assert.equal(resolvePostLoginPath(true, "/onboarding"), "/admin");
  assert.equal(resolvePostLoginPath(true, "/admin/companies"), "/admin");
});

test("staff keep confirm and claim links", () => {
  assert.equal(
    resolvePostLoginPath(true, "/confirm-reference/abc"),
    "/confirm-reference/abc",
  );
  assert.equal(
    resolvePostLoginPath(true, "/confirm/abc"),
    "/confirm/abc",
  );
  assert.equal(resolvePostLoginPath(true, "/claim/abc"), "/claim/abc");
});

test("staff keep confirm links with query", () => {
  assert.equal(
    resolvePostLoginPath(true, "/confirm-reference/abc?x=1"),
    "/confirm-reference/abc?x=1",
  );
});

test("non-staff cannot stay on /admin", () => {
  assert.equal(resolvePostLoginPath(false, "/admin"), "/dashboard");
  assert.equal(resolvePostLoginPath(false, "/admin/companies"), "/dashboard");
  assert.equal(resolvePostLoginPath(false, "/dashboard/insights"), "/dashboard/insights");
});
