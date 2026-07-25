#!/usr/bin/env node
/**
 * Pre-live env check. Run:
 *   node scripts/check-live-env.mjs
 * Or against production-shaped env:
 *   node scripts/check-live-env.mjs --prod
 *
 * Loads .env.local if present (does not print secret values).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#") || !t.includes("=")) continue;
    const i = t.indexOf("=");
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadEnvFile(path.join(root, ".env.local"));

const isProd =
  process.env.VERCEL_ENV === "production" ||
  process.env.NODE_ENV === "production" ||
  process.argv.includes("--prod");

function present(name) {
  const v = process.env[name]?.trim();
  if (!v) return { ok: false, detail: "missing" };
  if (/^your_|YOUR_PROJECT|placeholder/i.test(v)) {
    return { ok: false, detail: "placeholder" };
  }
  return { ok: true, detail: "set" };
}

const checks = [];

function requireKey(name) {
  const r = present(name);
  checks.push({ name, ...r, required: true });
}

function optionalKey(name) {
  const r = present(name);
  checks.push({ name, ...r, required: false });
}

requireKey("NEXT_PUBLIC_SITE_URL");
requireKey("NEXT_PUBLIC_SUPABASE_URL");
if (
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() &&
  !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
) {
  checks.push({
    name: "NEXT_PUBLIC_SUPABASE_ANON_KEY|PUBLISHABLE_KEY",
    ok: false,
    detail: "missing",
    required: true,
  });
} else {
  checks.push({
    name: "NEXT_PUBLIC_SUPABASE_ANON_KEY|PUBLISHABLE_KEY",
    ok: true,
    detail: "set",
    required: true,
  });
}
requireKey("SUPABASE_SERVICE_ROLE_KEY");

if (isProd) {
  requireKey("RESEND_API_KEY");
  requireKey("RESEND_FROM_EMAIL");
  const from = process.env.RESEND_FROM_EMAIL?.trim() ?? "";
  if (from && /onboarding@resend\.dev/i.test(from)) {
    checks.push({
      name: "RESEND_FROM_EMAIL domain",
      ok: false,
      detail: "must not use onboarding@resend.dev in production",
      required: true,
    });
  }
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
  if (site && !/^https:\/\/(www\.)?hansala\.com\/?$/i.test(site)) {
    checks.push({
      name: "NEXT_PUBLIC_SITE_URL host",
      ok: false,
      detail: `expected https://hansala.com, got ${site}`,
      required: true,
    });
  }
} else {
  optionalKey("RESEND_API_KEY");
  optionalKey("RESEND_FROM_EMAIL");
}

console.log(isProd ? "Mode: production checks\n" : "Mode: local/dev checks\n");
let failed = 0;
for (const c of checks) {
  const mark = c.ok ? "ok" : c.required ? "FAIL" : "warn";
  if (!c.ok && c.required) failed += 1;
  console.log(`[${mark}] ${c.name}: ${c.detail}`);
}

console.log("");
if (failed) {
  console.log(
    `${failed} required check(s) failed.\n` +
      "Fill .env.local (local) and Vercel → Settings → Environment Variables (production),\n" +
      "then redeploy. See .env.example and README.md.",
  );
  process.exit(1);
}

console.log("All required checks passed.");
if (!isProd) {
  console.log("Re-run with --prod before go-live:");
  console.log("  node scripts/check-live-env.mjs --prod");
}
