import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import Stripe from "stripe";

const ROOT = resolve(import.meta.dirname, "..");
const ENV_PATH = resolve(ROOT, ".env.local");

function loadEnv() {
  const text = readFileSync(ENV_PATH, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i === -1) continue;
    const key = trimmed.slice(0, i);
    let val = trimmed.slice(i + 1);
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

function upsertEnv(key, value) {
  let text = readFileSync(ENV_PATH, "utf8");
  const re = new RegExp(`^${key}=.*$`, "m");
  const line = `${key}=${value}`;
  text = re.test(text)
    ? text.replace(re, line)
    : `${text.trimEnd()}\n${line}\n`;
  writeFileSync(ENV_PATH, text);
}

loadEnv();

const secret = process.env.STRIPE_SECRET_KEY?.trim();
if (!secret) {
  console.error("Missing STRIPE_SECRET_KEY in .env.local");
  process.exit(1);
}

const stripe = new Stripe(secret);
const AMOUNT = 7900;
const CURRENCY = "eur";

const products = await stripe.products.list({ limit: 100, active: true });
let product = products.data.find((p) => p.metadata?.linken_plan === "pro");

if (!product) {
  product = await stripe.products.create({
    name: "Hansala Pro",
    description: "Premium embed widgets, analytics, and Pro embeds.",
    metadata: { linken_plan: "pro" },
  });
  console.log("Created product:", product.id);
} else {
  console.log("Using product:", product.id);
}

const prices = await stripe.prices.list({ product: product.id, active: true });
let price = prices.data.find(
  (p) =>
    p.recurring?.interval === "month" &&
    p.unit_amount === AMOUNT &&
    p.currency === CURRENCY,
);

if (!price) {
  price = await stripe.prices.create({
    product: product.id,
    unit_amount: AMOUNT,
    currency: CURRENCY,
    recurring: { interval: "month" },
    metadata: { linken_plan: "pro" },
  });
  console.log("Created price:", price.id);
} else {
  console.log("Using price:", price.id);
}

upsertEnv("STRIPE_PRICE_PRO_MONTHLY", price.id);
upsertEnv("STRIPE_PRO_DISPLAY_PRICE", "€79 / month");
upsertEnv("STRIPE_PRO_DISPLAY_LABEL", "Pro");

console.log("\nDone. STRIPE_PRICE_PRO_MONTHLY saved to .env.local");
console.log("Mode:", secret.startsWith("sk_live") ? "LIVE" : "TEST");
console.log("\nNext: add STRIPE_WEBHOOK_SECRET after creating webhook in Stripe Dashboard.");
