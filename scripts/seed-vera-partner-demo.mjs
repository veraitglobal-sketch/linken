#!/usr/bin/env node
/**
 * Wire demo referred clients onto production company slug "vera".
 * Uses linked Supabase project via CLI api-keys (not committed).
 */
import { createClient } from "@supabase/supabase-js";
import { execFileSync } from "child_process";

const PROJECT = "bhffbacsmbsppywcucof";
const PARTNER_SLUG = "vera";

function serviceRoleKey() {
  const raw = execFileSync(
    "npx",
    ["supabase", "projects", "api-keys", "--project-ref", PROJECT],
    { encoding: "utf8", maxBuffer: 2_000_000 },
  );
  const json = JSON.parse(raw);
  const key = json.keys?.find(
    (k) => k.id === "service_role" || k.name === "service_role",
  );
  if (!key?.api_key) throw new Error("service_role key not found");
  return key.api_key;
}

const admin = createClient(
  `https://${PROJECT}.supabase.co`,
  serviceRoleKey(),
  { auth: { autoRefreshToken: false, persistSession: false } },
);

async function upsertReferred(veraId, row) {
  const { data: existing } = await admin
    .from("companies")
    .select("id")
    .eq("slug", row.slug)
    .maybeSingle();

  const payload = {
    name: row.name,
    claimed: false,
    plan: row.plan,
    website: row.website,
    referred_by_company_id: veraId,
    organization_kind: "company",
    category: "Software",
    city: "Berlin",
    description: row.description,
    tagline: row.tagline,
    owner_id: null,
    claim_token: row.claim_token,
  };

  if (existing?.id) {
    const { error } = await admin
      .from("companies")
      .update(payload)
      .eq("id", existing.id);
    if (error) throw error;
    return existing.id;
  }

  const { data, error } = await admin
    .from("companies")
    .insert({
      ...payload,
      slug: row.slug,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function main() {
  const { data: vera, error: vErr } = await admin
    .from("companies")
    .select("id, slug, name")
    .eq("slug", PARTNER_SLUG)
    .maybeSingle();
  if (vErr || !vera) throw new Error(vErr?.message ?? "vera not found");
  console.log("partner", vera.slug, vera.id);

  const freeId = await upsertReferred(vera.id, {
    name: "Demo Client Free",
    slug: "vera-demo-client-free",
    website: "https://demo-free.example.com",
    plan: "free",
    description: "Test referral for Vera — free until they pay.",
    tagline: "Test free referral",
    claim_token: crypto.randomUUID(),
  });
  console.log("referred free", freeId);

  const proId = await upsertReferred(vera.id, {
    name: "Demo Client Pro",
    slug: "vera-demo-client-pro",
    website: "https://demo-pro.example.com",
    plan: "pro",
    description: "Test referral for Vera — pro plan.",
    tagline: "Test pro referral",
    claim_token: crypto.randomUUID(),
  });
  console.log("referred pro", proId);

  const { data: accrued, error: rpcErr } = await admin.rpc(
    "accrue_partner_commission",
    {
      p_referrer_company_id: vera.id,
      p_company_id: proId,
      p_stripe_invoice_id: `in_vera_demo_${Date.now()}`,
      p_invoice_total_cents: 7900,
      p_commission_cents: 790,
      p_currency: "eur",
    },
  );
  if (rpcErr) console.log("commission_rpc FAIL:", rpcErr.message);
  else console.log("commission_rpc OK", accrued);

  const { count } = await admin
    .from("companies")
    .select("id", { count: "exact", head: true })
    .eq("referred_by_company_id", vera.id);
  console.log("referred_count", count);
  console.log("Open https://hansala.com/dashboard/developer (logged in as Vera)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
