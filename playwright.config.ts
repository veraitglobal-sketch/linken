import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";

/**
 * Projects:
 * - smoke: fast public routes + form labels (CI default with a11y)
 * - a11y: axe WCAG checks
 * Full auth journeys: set E2E_USER_* or use scripts/e2e-confirm-verify.mjs
 */
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 8_000 },
  reporter: process.env.CI
    ? [["github"], ["list", { printSteps: true }]]
    : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "off",
    actionTimeout: 10_000,
  },
  projects: [
    {
      name: "smoke",
      testMatch: /smoke\.spec\.ts|journeys\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "a11y",
      testMatch: /a11y\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run start",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
