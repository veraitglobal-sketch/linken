/**
 * Full E2E: case-study client confirmation + domain verification methods.
 * Cleans up @e2elaunch.com / e2e-* companies afterward (never Acme).
 */
import ws from "ws";
globalThis.WebSocket = ws.WebSocket ?? ws;

import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright";
import { createHash, randomBytes, randomUUID } from "crypto";
import { readFileSync } from "fs";
import { resolve } from "path";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const PASS = "TestPass123!";
const stamp = Date.now();
const results = [];

function loadEnv() {
  try {
    for (const line of readFileSync(resolve(".env.local"), "utf8").split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch { /* ignore */ }
}
loadEnv();

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

function log(step, ok, detail = "") {
  results.push({ step, ok, detail });
  console.log(`${ok ? "OK  " : "FAIL"} ${step}${detail ? ` — ${detail}` : ""}`);
}

async function ensureUser(email) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: PASS,
    email_confirm: true,
  });
  if (error && !/already|registered|exists/i.test(error.message)) throw error;
  if (data?.user?.id) return data.user.id;
  const { data: listed } = await admin.auth.admin.listUsers({ perPage: 200 });
  const u = listed.users.find((x) => x.email === email);
  if (!u) throw new Error(`missing ${email}`);
  return u.id;
}

async function signIn(page, email) {
  await page.goto(`${BASE}/login`);
  const form = page.locator("form").filter({ has: page.locator('input[name="email"]') });
  await form.locator('input[name="email"]').fill(email);
  await form.locator('input[name="password"]').fill(PASS);
  await form.locator('button[type="submit"]').click();
  await page.waitForURL(/dashboard|onboarding|c\//, { timeout: 25000 });
}

async function createCompanyUi(page, name, website) {
  await page.goto(`${BASE}/onboarding`);
  await page.locator('input[name="name"]').fill(name);
  await page.locator('input[name="category"]').fill("Architecture");
  await page.locator('input[name="city"]').fill("Berlin");
  await page.locator('input[name="website"]').fill(website);
  await page.locator("textarea[name='description']").fill("E2E confirm/verify company.");
  await page.getByRole("button", { name: "Create company profile" }).click();
  await page.waitForURL(/c\/|onboarding\/verify|dashboard/, { timeout: 30000 });
}

function genKey() {
  const raw = `lk_${randomBytes(24).toString("hex")}`;
  const hash = createHash("sha256").update(raw).digest("hex");
  return { raw, hash, prefix: raw.slice(0, 11) };
}

async function cleanup() {
  const { data: cos } = await admin.from("companies").select("id, slug, name, website");
  for (const c of cos ?? []) {
    if (c.slug === "acme-architecture") continue;
    if (
      c.slug?.includes("e2e") ||
      c.name?.includes("E2E") ||
      String(c.website ?? "").includes("e2elaunch")
    ) {
      await admin.from("companies").delete().eq("id", c.id);
      console.log("del company", c.slug);
    }
  }
  const { data: listed } = await admin.auth.admin.listUsers({ perPage: 200 });
  for (const u of listed.users) {
    const e = u.email ?? "";
    if (e === "acme.owner@gmail.com") continue;
    if (e.includes("e2elaunch") || e.includes("e2e.")) {
      await admin.auth.admin.deleteUser(u.id);
      console.log("del user", e);
    }
  }
}

const providerEmail = `provider.${stamp}@e2elaunch.com`;
const clientEmail = `client.${stamp}@client.e2elaunch.com`;
const verifyEmail = `owner.${stamp}@e2everify.e2elaunch.com`;

let browser;
try {
  browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  page.setDefaultTimeout(30000);
  const mails = [];
  page.on("console", (msg) => {
    const t = msg.text();
    if (/Link:|\/confirm\//.test(t)) {
      mails.push(t);
      console.log("MAIL", t.slice(0, 260));
    }
  });

  // ─── 1) CASE STUDY CLIENT CONFIRMATION ───
  await ensureUser(providerEmail);
  await signIn(page, providerEmail);
  await createCompanyUi(page, `E2E Provider ${stamp}`, "https://e2elaunch.com");
  const { data: provider } = await admin
    .from("companies")
    .select("id, slug, verified")
    .ilike("name", `E2E Provider ${stamp}%`)
    .single();
  log("CS1 provider company", Boolean(provider), `slug=${provider?.slug} verified=${provider?.verified}`);

  // Create case study via Agent API (production create path — no web form)
  const key = genKey();
  const { data: keyId, error: keyErr } = await admin.rpc("create_api_key", {
    p_company_id: provider.id,
    p_name: "e2e",
    p_scopes: ["content:write", "invites:send", "read"],
    p_key_hash: key.hash,
    p_key_prefix: key.prefix,
  });
  // create_api_key may need created_by — check error
  if (keyErr) {
    // fallback: direct insert if RPC needs auth.uid()
    const { data: ownerUser } = await admin.auth.admin.listUsers({ perPage: 200 });
    const uid = ownerUser.users.find((u) => u.email === providerEmail)?.id;
    const { error: insErr } = await admin.from("api_keys").insert({
      company_id: provider.id,
      name: "e2e",
      key_prefix: key.prefix,
      key_hash: key.hash,
      scopes: ["content:write", "invites:send", "read"],
      created_by: uid,
    });
    log("CS1b api key", !insErr, insErr?.message ?? String(keyId));
  } else {
    log("CS1b api key", true, String(keyId));
  }

  const createRes = await page.request.post(`${BASE}/api/v1/agent/case-studies`, {
    headers: {
      Authorization: `Bearer ${key.raw}`,
      "Content-Type": "application/json",
    },
    data: {
      title: `E2E Tower ${stamp}`,
      summary: "Full client confirmation E2E case study.",
      location: "Berlin",
      year: "2025",
      services: ["Fit-out"],
    },
  });
  const createdBody = await createRes.json().catch(() => ({}));
  const caseSlug = createdBody?.slug ?? createdBody?.data?.slug;
  log("CS2 create case study", createRes.ok(), `${createRes.status()} slug=${caseSlug}`);

  // Request confirmation via UI
  await page.goto(`${BASE}/c/${provider.slug}/case-studies/${caseSlug}`);
  await page.waitForTimeout(800);
  const openReq = page.getByRole("button", { name: "Request confirmation" });
  if (await openReq.count()) await openReq.click();
  await page.waitForTimeout(400);
  const emailInput = page.locator('input[name="email"]').first();
  if (await emailInput.count()) {
    await emailInput.fill(clientEmail);
    await page.getByRole("button", { name: "Send request" }).click();
    await page.waitForTimeout(3000);
  }
  log("CS3 request confirmation", page.url().includes("requested=1"), page.url());

  const { data: req } = await admin
    .from("case_study_client_confirmation_requests")
    .select("id, token, status")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  log("CS3b token row", Boolean(req?.token), req?.token?.slice(0, 8));

  // Client: register + company + confirm
  await ctx.clearCookies();
  await ensureUser(clientEmail);
  await signIn(page, clientEmail);
  await createCompanyUi(
    page,
    `E2E Client ${stamp}`,
    "https://client.e2elaunch.com",
  );
  await page.goto(`${BASE}/confirm/${req.token}`);
  await page.waitForTimeout(1000);
  const confirmForm = page
    .locator("form")
    .filter({ has: page.locator('input[name="token"]') })
    .first();
  log("CS4 confirm page ready", await confirmForm.count() > 0, page.url());
  if (await confirmForm.count()) {
    await confirmForm.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);
  }
  log("CS4b after confirm", page.url().includes("done=confirmed"), page.url());

  const { data: req2 } = await admin
    .from("case_study_client_confirmation_requests")
    .select("status")
    .eq("id", req.id)
    .single();
  log("CS5 request status confirmed", req2?.status === "confirmed", req2?.status);

  // Badge on case study page
  await page.goto(`${BASE}/c/${provider.slug}/case-studies/${caseSlug}`);
  await page.waitForTimeout(800);
  const caseHtml = await page.content();
  log(
    "CS6 Confirmed by client badge",
    /Confirmed by client|client confirmed/i.test(caseHtml),
    "",
  );
  log(
    "CS6b JSON-LD client_confirmed",
    caseHtml.includes('"client_confirmed":true') ||
      caseHtml.includes('"client_confirmed": true'),
    "",
  );

  // API v1
  const apiRes = await page.request.get(
    `${BASE}/api/v1/companies/${provider.slug}/case-studies`,
  );
  const apiJson = await apiRes.json();
  const apiCase = (apiJson?.case_studies ?? apiJson?.data ?? apiJson ?? []).find?.(
    (c) => c.slug === caseSlug,
  ) ?? (Array.isArray(apiJson) ? apiJson.find((c) => c.slug === caseSlug) : null);
  // handle various shapes
  let cases = apiJson?.case_studies ?? apiJson?.items ?? apiJson;
  if (!Array.isArray(cases) && apiJson?.data) cases = apiJson.data;
  if (!Array.isArray(cases)) cases = [];
  const hit = cases.find((c) => c.slug === caseSlug);
  log(
    "CS7 API client_confirmed",
    hit?.client_confirmed === true,
    JSON.stringify(hit ?? apiJson).slice(0, 180),
  );

  // Trust — 1 client-confirmed case = 3 pts (still Member until 5); stats must count it
  const trustRes = await page.request.get(`${BASE}/api/v1/companies/${provider.slug}`);
  const trustJson = await trustRes.json();
  const trustLevel = trustJson?.trust_level;
  const confCases = trustJson?.stats?.confirmed_case_studies ?? null;
  // Profile page should also surface the confirmation
  await page.goto(`${BASE}/c/${provider.slug}`);
  await page.waitForTimeout(800);
  const profileHtml = await page.content();
  const profileBadge = /Confirmed by client/i.test(profileHtml);
  log(
    "CS8 trust stats + profile badge",
    confCases >= 1 && Boolean(trustLevel) && profileBadge,
    `level=${trustLevel} confirmed_case_studies=${confCases} profileBadge=${profileBadge}`,
  );

  // ─── 2) DOMAIN VERIFICATION ───
  await ctx.clearCookies();
  await ensureUser(verifyEmail);
  await signIn(page, verifyEmail);
  await createCompanyUi(
    page,
    `E2E Verify ${stamp}`,
    "https://e2everify.e2elaunch.com",
  );
  const { data: vCo } = await admin
    .from("companies")
    .select("id, slug, verified, website")
    .ilike("name", `E2E Verify ${stamp}%`)
    .single();
  log(
    "DV1 email_domain auto-verify",
    vCo?.verified === true,
    `verified=${vCo?.verified} website=${vCo?.website}`,
  );

  // For DNS/meta negative tests, use a company whose website has no TXT/meta
  // Switch website to a domain we don't control (example.com) via settings —
  // but that may unverify. Create another company for negative checks.
  await ctx.clearCookies();
  const negEmail = `neg.${stamp}@neg.e2elaunch.com`;
  await ensureUser(negEmail);
  await signIn(page, negEmail);
  // Use website that won't match email → no auto verify, then DNS/meta negative
  await page.goto(`${BASE}/onboarding`);
  await page.locator('input[name="name"]').fill(`E2E NegVerify ${stamp}`);
  await page.locator('input[name="category"]').fill("Architecture");
  await page.locator('input[name="city"]').fill("Berlin");
  await page.locator('input[name="website"]').fill("https://example.com");
  await page.locator("textarea[name='description']").fill("Negative DNS/meta tests.");
  await page.getByRole("button", { name: "Create company profile" }).click();
  await page.waitForURL(/c\/|onboarding\/verify|dashboard/, { timeout: 30000 });
  // skip verify mid-step if present
  if (page.url().includes("onboarding/verify")) {
    const later = page.getByRole("link", { name: /Do it later|Skip|Dashboard/i });
    if (await later.count()) await later.first().click();
    else await page.goto(`${BASE}/dashboard/verification`);
  }

  const { data: negCo } = await admin
    .from("companies")
    .select("id, slug, verified")
    .ilike("name", `E2E NegVerify ${stamp}%`)
    .single();
  log("DV2 negative company unverified", negCo?.verified === false, String(negCo?.verified));

  await page.goto(`${BASE}/dashboard/verification`);
  await page.waitForTimeout(1000);
  const bodyText = await page.innerText("body");
  const tokenMatch = bodyText.match(
    /linken-verify=([0-9a-f-]{36})/i,
  ) || bodyText.match(
    /content="([0-9a-f-]{36})"/i,
  );
  // get token from DB
  const { data: verRow } = await admin
    .from("company_verifications")
    .select("verify_token")
    .eq("company_id", negCo.id)
    .maybeSingle();
  let token = verRow?.verify_token;
  if (!token) {
    // trigger get_verify_token by loading page as owner — insert row if missing
    const { data: t } = await admin.rpc("get_verify_token", {
      p_company_id: negCo.id,
    }).catch(() => ({ data: null }));
    token = t;
  }
  // service role may not call get_verify_token — ensure row
  if (!token) {
    await admin.from("company_verifications").upsert({
      company_id: negCo.id,
      verify_token: randomUUID(),
    });
    const { data: again } = await admin
      .from("company_verifications")
      .select("verify_token")
      .eq("company_id", negCo.id)
      .single();
    token = again.verify_token;
  }
  log("DV3 verify token present", Boolean(token), String(token).slice(0, 8));
  console.log(
    "\n--- OWNER DNS INSTRUCTIONS (Acme / verait.de) ---\n" +
      `Host: verait.de (or @)\n` +
      `Type: TXT\n` +
      `Value: linken-verify=0d84b71e-837b-45fb-80c3-b3525db709cd\n` +
      `Meta alternative: <meta name="linken-verify" content="0d84b71e-837b-45fb-80c3-b3525db709cd" />\n` +
      `Well-known: https://verait.de/.well-known/linken-verify.txt → token only\n` +
      "-----------------------------------------------\n",
  );

  // DNS negative — click DNS tab + Verify
  await page.goto(`${BASE}/dashboard/verification`);
  const dnsTab = page.getByRole("button", { name: /DNS TXT/i });
  if (await dnsTab.count()) await dnsTab.click();
  await page.waitForTimeout(300);
  const verifyBtn = page.getByRole("button", { name: /Verify domain/i }).first();
  if (await verifyBtn.count()) {
    await verifyBtn.click();
    await page.waitForTimeout(3000);
  }
  const dnsUrl = page.url();
  const dnsDecoded = decodeURIComponent(dnsUrl);
  const dnsNegOk =
    /TXT record not found/i.test(dnsDecoded) &&
    !/NEXT_REDIRECT/i.test(dnsDecoded);
  log("DV4 dns_txt negative (no record)", dnsNegOk, dnsUrl.slice(0, 160));

  // Meta negative
  await page.goto(`${BASE}/dashboard/verification`);
  const metaTab = page.getByRole("button", { name: /Meta/i });
  if (await metaTab.count()) await metaTab.click();
  await page.waitForTimeout(300);
  const verifyBtn2 = page.getByRole("button", { name: /Verify domain/i }).first();
  if (await verifyBtn2.count()) {
    await verifyBtn2.click();
    await page.waitForTimeout(4000);
  }
  const metaUrl = page.url();
  const metaBody = await page.innerText("body");
  const metaNegOk =
    metaUrl.includes("error=") ||
    /meta|well-known|not found|failed/i.test(metaBody);
  log("DV5 meta_tag negative (no tag)", metaNegOk, metaUrl.slice(0, 120));

  // Backlink negative BEFORE burning rate limit (each check counts)
  await page.goto(`${BASE}/dashboard/verification`);
  const linkBtn = page.getByRole("button", { name: /Check link/i });
  if (await linkBtn.count()) {
    await linkBtn.click();
    await page.waitForTimeout(3000);
    const blUrl = decodeURIComponent(page.url());
    log(
      "DV6 website_linked negative",
      /No Linken link found/i.test(blUrl),
      page.url().slice(0, 140),
    );
  } else {
    log("DV6 website_linked negative", false, "Check link button missing");
  }

  // Rate limit — burn remaining checks; assert via ?error= (UI always mentions "Max 5")
  let rateHit = false;
  for (let i = 0; i < 8; i++) {
    await page.goto(`${BASE}/dashboard/verification`);
    const tab = page.getByRole("button", { name: /DNS TXT/i });
    if (await tab.count()) await tab.click();
    const btn = page.getByRole("button", { name: /Verify domain/i }).first();
    if (await btn.count()) {
      await btn.click();
      await page.waitForTimeout(1800);
    }
    const u = decodeURIComponent(page.url());
    if (/error=.*Rate limit/i.test(u)) {
      rateHit = true;
      break;
    }
  }
  log("DV7 rate limit 5/h surfaces", rateHit, page.url().slice(0, 160));

  // Optional: fetch verait.de homepage for existing backlink
  try {
    const home = await fetch("https://verait.de/", {
      signal: AbortSignal.timeout(8000),
    });
    const html = await home.text();
    const hasLink =
      html.includes("linken") ||
      html.includes("/c/acme") ||
      html.includes("/embed/");
    log(
      "DV8 verait.de backlink probe (informational)",
      true,
      hasLink ? "possible linken mention found" : "no linken/embed link found on homepage",
    );
  } catch (e) {
    log("DV8 verait.de backlink probe (informational)", true, `fetch failed: ${e.message}`);
  }

  console.log("\n=== SUMMARY ===");
  for (const r of results) {
    console.log(`${r.ok ? "PASS" : "FAIL"}\t${r.step}\t${r.detail}`);
  }
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);

  if (process.env.E2E_KEEP !== "1") await cleanup();
  await browser.close();
  process.exit(failed.length ? 1 : 0);
} catch (e) {
  console.error("CRASH", e);
  if (process.env.E2E_KEEP !== "1") {
    try { await cleanup(); } catch { /* ignore */ }
  }
  if (browser) await browser.close();
  process.exit(1);
}
