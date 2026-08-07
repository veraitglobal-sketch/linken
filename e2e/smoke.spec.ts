import { test, expect } from "@playwright/test";

/**
 * Fast post-build smoke — public routes only (no auth / no DB seeds).
 * Stable selectors; no waits on animations.
 */

const ROUTES = [
  "/",
  "/login",
  "/onboarding",
  "/pricing",
  "/developers",
  "/privacy",
  "/terms",
  "/data-deletion",
  "/requests/new",
];

for (const path of ROUTES) {
  test(`smoke GET ${path} returns 200 and has main landmark`, async ({
    page,
  }) => {
    const res = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(res?.ok() ?? false).toBeTruthy();
    await expect(page.locator("#main-content")).toHaveCount(1);
  });
}

test("smoke: login form has accessible email and password fields", async ({
  page,
}) => {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
  await expect(page.getByLabel(/^email$/i)).toBeVisible();
  await expect(page.getByLabel(/^password$/i)).toBeVisible();
});

test("smoke: onboarding form has company name label", async ({ page }) => {
  await page.goto("/onboarding", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", { name: /register your company/i }),
  ).toBeVisible();
});

test("smoke: public API company unknown slug is 404 JSON", async ({
  request,
}) => {
  const res = await request.get("/api/v1/companies/__no-such-company-qa__");
  expect(res.status()).toBe(404);
  const body = await res.json();
  expect(body.error?.code).toBe("not_found");
});
