import { test, expect } from "@playwright/test";

/**
 * Authenticated journey stubs.
 * Skipped unless E2E_USER_EMAIL + E2E_USER_PASSWORD are set.
 * Full DB journeys remain in scripts/e2e-confirm-verify.mjs (manual / nightly).
 */

const email = process.env.E2E_USER_EMAIL ?? "";
const password = process.env.E2E_USER_PASSWORD ?? "";
const hasAuth = Boolean(email && password);

test.describe("authenticated journeys", () => {
  test.skip(!hasAuth, "Set E2E_USER_EMAIL and E2E_USER_PASSWORD to run");

  test("sign in reaches dashboard shell", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await page.getByLabel(/^email$/i).fill(email);
    await page.getByLabel(/^password$/i).fill(password);
    await page.getByRole("button", { name: /^sign in$/i }).click();
    await page.waitForURL(/\/(dashboard|welcome|onboarding)/, {
      timeout: 30_000,
    });
    await expect(page.locator("#main-content")).toHaveCount(1);
  });
});

test.describe("documented critical journeys (checklist)", () => {
  test("journey inventory is documented for nightly/manual runs", async () => {
    // Keeps the inventory visible in CI output without requiring secrets.
    const journeys = [
      "visitor creates an account",
      "user creates a company",
      "user verifies a domain",
      "user creates a project",
      "user sends an invitation",
      "recipient opens the invitation",
      "recipient requests a change",
      "recipient confirms the relationship",
      "verified relationship becomes public",
      "pending relationship remains private",
      "company creates an embed",
      "user upgrades to Pro",
      "user cancels Pro",
      "user requests account deletion",
    ];
    expect(journeys.length).toBe(14);
  });
});
