import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * WCAG 2.2 AA automated checks on major public routes.
 * Color-contrast on dark marketing stages is tracked separately in docs/A11Y-PERF.md
 * (low-opacity whites); CI fails on all other serious/critical rules.
 * Run: npm run build && npm run test:a11y
 */
const routes = [
  { path: "/", name: "homepage" },
  { path: "/login", name: "login" },
  { path: "/onboarding", name: "onboarding" },
  { path: "/pricing", name: "pricing" },
  { path: "/developers", name: "developers" },
  { path: "/privacy", name: "privacy" },
  { path: "/terms", name: "terms" },
  { path: "/cookies", name: "cookies" },
  { path: "/security", name: "security" },
  { path: "/requests/new", name: "project-request" },
];

for (const route of routes) {
  test(`a11y: ${route.name} (${route.path})`, async ({ page }) => {
    await page.goto(route.path, { waitUntil: "domcontentloaded" });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .disableRules(["color-contrast"])
      .analyze();

    const serious = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );

    expect(
      serious,
      serious
        .map(
          (v) =>
            `${v.id} (${v.impact}): ${v.help} — ${v.nodes
              .slice(0, 3)
              .map((n) => n.target.join(" "))
              .join("; ")}`,
        )
        .join("\n"),
    ).toEqual([]);
  });
}

test("skip link reaches main content on homepage", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const focused = page.locator(":focus");
  await expect(focused).toHaveAttribute("href", "#main-content");
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

/** Contrast smoke — footer + body tokens must pass on navy/paper. */
test("a11y contrast: homepage footer links", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page })
    .include("footer")
    .withTags(["wcag2aa"])
    .options({ runOnly: { type: "rule", values: ["color-contrast"] } })
    .analyze();
  expect(results.violations).toEqual([]);
});
