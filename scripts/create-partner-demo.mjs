#!/usr/bin/env node
/**
 * One-shot: partner demo user + company + referred clients (+ sample accrual if RPC exists).
 * Usage: node scripts/create-partner-demo.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

const EMAIL = "partner-demo@e2elaunch.com";
const PASS = "PartnerDemo123!";
const PARTNER_SLUG = "partner-demo-studio";
const CLIENT_FREE_SLUG = "partner-demo-client-free";
const CLIENT_PRO_SLUG = "partner-demo-client-pro";

function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!m || process.env[m[1]]) continue;
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    /* ignore */
  }
}
loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !service) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, service, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function ensureUser() {
  const { data: created, error } = await admin.auth.admin.createUser({
    email: EMAIL,
    password: PASS,
    email_confirm: true,
  });
  if (created?.user?.id) return created.user.id;
  if (error && !/already|registered|exists/i.test(error.message)) {
    throw error;
  }
  const { data, error: listErr } = await admin.auth.admin.listUsers({
    perPage: 500,
  });
  if (listErr) throw listErr;
  const u = data.users.find((x) => x.email === EMAIL);
  if (!u) throw new Error(`user not found after create: ${EMAIL}`);
  await admin.auth.admin.updateUserById(u.id, {
    password: PASS,
    email_confirm: true,
  });
  return u.id;
}

async function upsertCompany(row) {
  const { data: existing } = await admin
    .from("companies")
    .select("id, slug")
    .eq("slug", row.slug)
    .maybeSingle();
  if (existing?.id) {
    const { error } = await admin
      .from("companies")
      .update({
        name: row.name,
        owner_id: row.owner_id ?? null,
        claimed: row.claimed,
        plan: row.plan,
        website: row.website,
        referred_by_company_id: row.referred_by_company_id ?? null,
        organization_kind: row.organization_kind ?? "company",
        category: row.category ?? "Software",
        city: row.city ?? "Berlin",
        description: row.description ?? "Partner demo company.",
        tagline: row.tagline ?? "Partner demo",
      })
      .eq("id", existing.id);
    if (error) throw error;
    return existing.id;
  }
  const { data, error } = await admin
    .from("companies")
    .insert({
      owner_id: row.owner_id ?? null,
      claimed: row.claimed,
      claim_token: null,
      name: row.name,
      slug: row.slug,
      organization_kind: row.organization_kind ?? "company",
      category: row.category ?? "Software",
      city: row.city ?? "Berlin",
      website: row.website,
      description: row.description ?? "Partner demo company.",
      tagline: row.tagline ?? "Partner demo",
      plan: row.plan ?? "free",
      referred_by_company_id: row.referred_by_company_id ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function main() {
  const userId = await ensureUser();
  console.log("user", userId, EMAIL);

  const partnerId = await upsertCompany({
    owner_id: userId,
    claimed: true,
    name: "Partner Demo Studio",
    slug: PARTNER_SLUG,
    website: "https://partner-demo.e2elaunch.com",
    plan: "free",
    description: "Demo partner account for commission testing.",
    tagline: "Developer partner demo",
  });
  console.log("partner company", partnerId, PARTNER_SLUG);

  const freeId = await upsertCompany({
    owner_id: null,
    claimed: true,
    name: "Demo Client Free",
    slug: CLIENT_FREE_SLUG,
    website: "https://client-free.e2elaunch.com",
    plan: "free",
    referred_by_company_id: partnerId,
    description: "Referred free client — earns nothing until Pro.",
  });
  console.log("referred free", freeId, CLIENT_FREE_SLUG);

  const proId = await upsertCompany({
    owner_id: null,
    claimed: true,
    name: "Demo Client Pro",
    slug: CLIENT_PRO_SLUG,
    website: "https://client-pro.e2elaunch.com",
    plan: "pro",
    referred_by_company_id: partnerId,
    description: "Referred Pro client for commission demo.",
  });
  console.log("referred pro", proId, CLIENT_PRO_SLUG);

  const { data: accrued, error: rpcErr } = await admin.rpc(
    "accrue_partner_commission",
    {
      p_referrer_company_id: partnerId,
      p_company_id: proId,
      p_stripe_invoice_id: `in_demo_${Date.now()}`,
      p_invoice_total_cents: 7900,
      p_commission_cents: 790,
      p_currency: "eur",
    },
  );
  if (rpcErr) {
    console.log(
      "commission RPC skipped (apply migration 20260816120000_partner_commissions.sql):",
      rpcErr.message,
    );
  } else {
    console.log("sample commission accrued", accrued, "€7.90");
  }

  console.log("\n--- login ---");
  console.log("URL:      http://localhost:3000/login");
  console.log("Email:   ", EMAIL);
  console.log("Password:", PASS);
  console.log("Then open: /dashboard/developer");
  console.log("Referral:  http://localhost:3000/onboarding?ref=" + PARTNER_SLUG);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
