#!/usr/bin/env node
/**
 * Post-deploy smoke — hit a live base URL (no Playwright).
 * Usage: BASE_URL=https://hansala.com node scripts/post-deploy-smoke.mjs
 */

const BASE = (process.env.BASE_URL || process.env.PLAYWRIGHT_BASE_URL || "")
  .trim()
  .replace(/\/$/, "");

if (!BASE) {
  console.error(
    "Set BASE_URL to the deployed origin, e.g. https://hansala.com",
  );
  process.exit(2);
}

const PATHS = [
  "/",
  "/login",
  "/pricing",
  "/developers",
  "/privacy",
  "/api/v1/companies/__no-such-company-qa__",
];

let failed = 0;

for (const path of PATHS) {
  const url = `${BASE}${path}`;
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "user-agent": "Hansala-PostDeploy-Smoke/1.0" },
    });
    const expectOk = !path.includes("__no-such");
    const ok = expectOk ? res.status < 400 : res.status === 404;
    console.log(`${ok ? "OK  " : "FAIL"} ${res.status} ${path}`);
    if (!ok) failed += 1;
  } catch (err) {
    console.log(`FAIL ${path} — ${err instanceof Error ? err.message : err}`);
    failed += 1;
  }
}

if (failed) {
  console.error(`\n${failed} smoke check(s) failed against ${BASE}`);
  process.exit(1);
}
console.log(`\nAll smoke checks passed against ${BASE}`);
