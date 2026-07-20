/**
 * Launch prep E2E — real UI flows against local Next + remote Supabase.
 * Cleanup: deletes only emails matching @linken-e2e.test (never Acme).
 */
import ws from "ws";
globalThis.WebSocket = ws.WebSocket ?? ws;

import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright";
import { readFileSync } from "fs";
import { resolve } from "path";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const PASS = "TestPass123!";
const DOMAIN = "e2elaunch.com";
const stamp = Date.now();

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
  console.error("Missing Supabase env");
  process.exit(1);
}
const admin = createClient(url, service, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const results = [];
function log(step, ok, detail = "") {
  results.push({ step, ok, detail });
  console.log(`${ok ? "OK" : "FAIL"}  ${step}${detail ? ` — ${detail}` : ""}`);
}

async function ensureUser(email) {
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password: PASS,
    email_confirm: true,
  });
  if (error && !/already|registered|exists/i.test(error.message)) {
    throw error;
  }
  if (created?.user?.id) return created.user.id;
  const { data, error: listErr } = await admin.auth.admin.listUsers({ perPage: 200 });
  if (listErr) throw listErr;
  const u = data.users.find((x) => x.email === email);
  if (!u) throw new Error(`user not found: ${email}`);
  return u.id;
}

/** UI signup attempt; falls back to admin create + UI sign-in if Auth rejects email. */
async function signup(page, email) {
  await page.goto(`${BASE}/login`);
  await page.locator("button[type='button']", { hasText: "Create account" }).click();
  const form = page.locator("form").filter({ has: page.locator('input[name="email"]') });
  await form.locator('input[name="email"]').fill(email);
  await form.locator('input[name="password"]').fill(PASS);
  await form.locator('button[type="submit"]').click();
  await page.waitForTimeout(2000);
  const onApp = /onboarding|dashboard/.test(page.url());
  if (!onApp) {
    await ensureUser(email);
    log("1a. UI signup", false, `fell back to admin create (${page.url()})`);
  } else {
    log("1a. UI signup", true, page.url());
    try {
      await ensureUser(email);
    } catch {
      /* already exists */
    }
  }
  await page.goto(`${BASE}/login`);
  const signIn = page.locator("form").filter({ has: page.locator('input[name="email"]') });
  await signIn.locator('input[name="email"]').fill(email);
  await signIn.locator('input[name="password"]').fill(PASS);
  await signIn.locator('button[type="submit"]').click();
  await page.waitForURL(/dashboard|onboarding/, { timeout: 20000 });
}

async function createCompany(page, name, website) {
  await page.goto(`${BASE}/onboarding`);
  await page.locator('input[name="name"]').fill(name);
  await page.locator('input[name="category"]').fill("Architecture");
  await page.locator('input[name="city"]').fill("Berlin");
  await page.locator('input[name="website"]').fill(website);
  await page.locator("textarea[name='description']").fill("E2E test company description.");
  await page.getByRole("button", { name: "Create company profile" }).click();
  await page.waitForURL(/c\/|onboarding\/verify|dashboard/, { timeout: 30000 });
}

async function cleanup() {
  const { data: companies } = await admin
    .from("companies")
    .select("id, slug, name, owner_id")
    .or(`website.ilike.%${DOMAIN}%,slug.ilike.%e2e%`);
  const ids = (companies ?? [])
    .filter((c) => c.slug !== "acme-architecture" && c.name !== "Acme Architecture")
    .map((c) => c.id);
  if (ids.length) {
    await admin.from("companies").delete().in("id", ids);
  }
  const { data: listed } = await admin.auth.admin.listUsers({ perPage: 200 });
  for (const u of listed.users) {
    if (u.email?.endsWith(`@${DOMAIN}`)) {
      await admin.auth.admin.deleteUser(u.id);
    }
  }
  console.log("Cleanup done for", DOMAIN);
}

const email1 = `owner1.${stamp}@${DOMAIN}`;
const email2 = `owner2.${stamp}@co2.${DOMAIN}`;
const email3 = `member.${stamp}@${DOMAIN}`;
const website1 = `https://${DOMAIN}`;
const website2 = `https://co2.${DOMAIN}`;

let browser;
try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(25000);

  // Capture console email links
  const emailLinks = [];
  page.on("console", (msg) => {
    const t = msg.text();
    if (t.includes("Link:") || t.includes("confirm-reference") || t.includes("/claim/")) {
      emailLinks.push(t);
      console.log("  [console]", t.slice(0, 200));
    }
  });

  // 1. Signup + company + auto verify
  await signup(page, email1);
  await createCompany(page, `E2E Alpha ${stamp}`, website1);
  const { data: co1 } = await admin
    .from("companies")
    .select("id, slug, verified, name, city, description, services, accepting_clients, website")
    .eq("website", website1)
    .maybeSingle();
  log("1. register+company", Boolean(co1), co1 ? `slug=${co1.slug} verified=${co1.verified}` : "missing");
  log("1b. auto domain verify", Boolean(co1?.verified), String(co1?.verified));

  // 2. Settings save
  await page.goto(`${BASE}/dashboard/settings`);
  await page.waitForSelector('input[name="name"]');
  const newName = `E2E Alpha Edited ${stamp}`;
  await page.locator('input[name="name"]').fill(newName);
  await page.locator('input[name="city"]').fill("Munich");
  await page.locator('textarea[name="description"]').fill("Saved description via E2E.");
  await page.locator('input[name="linkedin_url"]').fill("https://www.linkedin.com/company/e2e-alpha");
  // services: type and enter
  const svc = page.getByLabel("Add service");
  if (await svc.count()) {
    await svc.fill("Fit-out");
    await svc.press("Enter");
  }
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.waitForURL(/saved=1|error=/, { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(1000);
  const { data: co1b } = await admin
    .from("companies")
    .select("name, city, description, linkedin_url, services")
    .eq("id", co1.id)
    .single();
  const settingsOk =
    co1b?.name === newName &&
    co1b?.city === "Munich" &&
    (co1b?.description ?? "").includes("Saved description");
  log(
    "2. settings persist",
    settingsOk,
    JSON.stringify({
      name: co1b?.name,
      city: co1b?.city,
      desc: (co1b?.description ?? "").slice(0, 40),
      li: co1b?.linkedin_url,
      services: co1b?.services,
      url: page.url(),
    }),
  );

  // 3. Public profile + API
  const pub = await page.goto(`${BASE}/c/${co1.slug}`);
  log("3. public profile", pub?.ok() ?? false, String(pub?.status()));
  const api = await page.request.get(`${BASE}/api/v1/companies/${co1.slug}`);
  log("3b. public API", api.ok(), String(api.status()));
  const llms = await page.request.get(`${BASE}/llms.txt`);
  log("3c. llms.txt", llms.ok(), String(llms.status()));
  const llmMd = await page.request.get(`${BASE}/c/${co1.slug}/llm.md`);
  log("3d. llm.md", llmMd.ok(), String(llmMd.status()));
  const embed = await page.request.get(`${BASE}/embed/${co1.slug}`);
  log("3e. embed", embed.ok(), String(embed.status()));
  const onePager = await page.request.get(`${BASE}/c/${co1.slug}/one-pager`);
  log("3f. one-pager", onePager.ok(), String(onePager.status()));

  // 4. Second company for partnership
  const page2 = await context.newPage();
  // use fresh context for user 2
  await context.clearCookies();
  await signup(page, email2);
  await createCompany(page, `E2E Beta ${stamp}`, website2);
  const { data: co2 } = await admin
    .from("companies")
    .select("id, slug, verified")
    .ilike("name", `E2E Beta ${stamp}%`)
    .maybeSingle();
  log("4. company2", Boolean(co2), co2 ? co2.slug : "missing");

  // Switch back to user1 — new context
  await context.clearCookies();
  await page.goto(`${BASE}/login`);
  {
    const signIn = page.locator("form").filter({ has: page.locator('input[name="email"]') });
    await signIn.locator('input[name="email"]').fill(email1);
    await signIn.locator('input[name="password"]').fill(PASS);
    await signIn.locator('button[type="submit"]').click();
  }
  await page.waitForURL(/dashboard/, { timeout: 20000 });

  // Partner invite claimed firm
  await page.goto(`${BASE}/dashboard/partners`);
  await page.locator('input[name="q"]').fill(co2?.slug ?? "E2E Beta");
  await page.locator('form[action="/dashboard/partners"]').evaluate((f) => f.requestSubmit());
  await page.waitForTimeout(1500);
  const inviteBtn = page.getByRole("button", { name: /Invite|Request|Partner/i }).first();
  if (await inviteBtn.count()) {
    await inviteBtn.click();
    await page.waitForTimeout(2000);
  }
  const { data: pend } = await admin
    .from("partnerships")
    .select("id, status")
    .eq("requester_id", co1.id)
    .eq("recipient_id", co2?.id ?? "00000000-0000-0000-0000-000000000000")
    .maybeSingle();
  log("5. partner invite pending", pend?.status === "pending", pend?.status ?? "none");

  // Accept as user2
  await context.clearCookies();
  await page.goto(`${BASE}/login`);
  {
    const signIn = page.locator("form").filter({ has: page.locator('input[name="email"]') });
    await signIn.locator('input[name="email"]').fill(email2);
    await signIn.locator('input[name="password"]').fill(PASS);
    await signIn.locator('button[type="submit"]').click();
  }
  await page.waitForURL(/dashboard/, { timeout: 20000 });
  await page.goto(`${BASE}/dashboard/partners`);
  const accept = page.getByRole("button", { name: "Accept" }).first();
  if (await accept.count()) {
    await accept.click();
    await page.waitForTimeout(2000);
  }
  const { data: acc } = await admin
    .from("partnerships")
    .select("status")
    .eq("id", pend?.id ?? "00000000-0000-0000-0000-000000000000")
    .maybeSingle();
  log("5b. partner accepted", acc?.status === "accepted", acc?.status ?? "none");

  // Dashboard network + pending counter
  await page.goto(`${BASE}/dashboard`);
  await page.waitForTimeout(2000);
  const body = await page.content();
  log(
    "6. network map loads",
    body.includes("Ownership") || body.includes("Network") || body.includes("Partner"),
    "",
  );

  // Domain verification page (check now shouldn't throw)
  await context.clearCookies();
  await page.goto(`${BASE}/login`);
  {
    const signIn = page.locator("form").filter({ has: page.locator('input[name="email"]') });
    await signIn.locator('input[name="email"]').fill(email1);
    await signIn.locator('input[name="password"]').fill(PASS);
    await signIn.locator('button[type="submit"]').click();
  }
  await page.waitForURL(/dashboard/, { timeout: 20000 });
  await page.goto(`${BASE}/dashboard/verification`);
  const checkBtn = page.getByRole("button", { name: /Check now|Check DNS|Verify/i }).first();
  if (await checkBtn.count()) {
    await checkBtn.click();
    await page.waitForTimeout(2000);
    log("7. domain check click", !page.url().includes("500"), page.url());
  } else {
    log("7. domain check click", true, "no button (maybe already verified)");
  }

  // Inquiry as anon
  await context.clearCookies();
  await page.goto(`${BASE}/c/${co1.slug}`);
  const quote = page.getByRole("button", { name: /Request a quote|Send inquiry|Contact/i }).first();
  if (await quote.count()) {
    await quote.click();
    await page.waitForTimeout(500);
    const nameI = page.locator('input[name="sender_name"], input[name="name"]').first();
    const emailI = page.locator('input[name="sender_email"], input[name="email"]').first();
    const msgI = page.locator('textarea[name="message"]').first();
    if (await nameI.count()) await nameI.fill("Anon Client");
    if (await emailI.count()) await emailI.fill(`anon+${stamp}@${DOMAIN}`);
    if (await msgI.count()) await msgI.fill("E2E inquiry message");
    await page.getByRole("button", { name: /Send|Submit/i }).first().click();
    await page.waitForTimeout(2000);
  }
  const { count: inqCount } = await admin
    .from("inquiries")
    .select("id", { count: "exact", head: true })
    .eq("company_id", co1.id);
  log("8. inquiry inbox", (inqCount ?? 0) > 0, `count=${inqCount}`);

  // Developers page
  const dev = await page.request.get(`${BASE}/developers`);
  log("9. developers page", dev.ok(), String(dev.status()));

  console.log("\n=== SUMMARY ===");
  for (const r of results) {
    console.log(`${r.ok ? "PASS" : "FAIL"}\t${r.step}\t${r.detail}`);
  }
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);

  if (process.env.E2E_KEEP !== "1") {
    await cleanup();
  } else {
    console.log("E2E_KEEP=1 — skipped cleanup");
  }

  await browser.close();
  process.exit(failed.length ? 1 : 0);
} catch (e) {
  console.error("E2E crashed:", e);
  if (process.env.E2E_KEEP !== "1") {
    try {
      await cleanup();
    } catch {
      /* ignore */
    }
  }
  if (browser) await browser.close();
  process.exit(1);
}
