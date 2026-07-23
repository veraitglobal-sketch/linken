/**
 * Quick Resend smoke test. Loads .env.local and sends one email.
 *
 * Usage:
 *   node scripts/test-resend.mjs you@example.com
 *
 * With onboarding@resend.dev, Resend only delivers to your Resend account email.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Resend } from "resend";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  try {
    const raw = readFileSync(path, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    console.warn("No .env.local found — using process.env only.");
  }
}

loadEnvLocal();

const to = process.argv[2];
if (!to) {
  console.error("Usage: node scripts/test-resend.mjs <recipient@email.com>");
  process.exit(1);
}

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.error("RESEND_API_KEY is missing. Add it to .env.local first.");
  process.exit(1);
}

const from = process.env.RESEND_FROM_EMAIL ?? "Hansala <onboarding@resend.dev>";
const resend = new Resend(apiKey);

const { data, error } = await resend.emails.send({
  from,
  to,
  subject: "Linken — Resend connected",
  text: [
    "Resend is wired up for Linken.",
    "",
    "Partner invites, claim emails, inbox notifications, and Radar digests will send through this account.",
    "",
    `Site URL: ${process.env.NEXT_PUBLIC_SITE_URL ?? "(not set)"}`,
  ].join("\n"),
});

if (error) {
  console.error("Resend error:", error);
  process.exit(1);
}

console.log("Sent. Resend id:", data?.id);
