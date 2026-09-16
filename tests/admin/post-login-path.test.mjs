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
  if (isStaff) return "/admin";
  const path = next.split("?")[0] ?? next;
  if (path === "/admin" || path.startsWith("/admin/")) return "/dashboard";
  return next;
}

test("staff always land on /admin", () => {
  assert.equal(resolvePostLoginPath(true, "/dashboard"), "/admin");
  assert.equal(resolvePostLoginPath(true, "/onboarding"), "/admin");
  assert.equal(resolvePostLoginPath(true, "/admin/companies"), "/admin");
});

test("non-staff cannot stay on /admin", () => {
  assert.equal(resolvePostLoginPath(false, "/admin"), "/dashboard");
  assert.equal(resolvePostLoginPath(false, "/admin/companies"), "/dashboard");
  assert.equal(resolvePostLoginPath(false, "/dashboard/insights"), "/dashboard/insights");
});
