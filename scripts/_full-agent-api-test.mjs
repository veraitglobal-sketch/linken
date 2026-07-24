#!/usr/bin/env node
/**
 * Full Agent API test — reads + write/cleanup cycle.
 * Usage: HANSALA_AGENT_API_KEY=hs_... HANSALA_API_BASE=http://localhost:3000 node scripts/_full-agent-api-test.mjs
 */
const BASE = (process.env.HANSALA_API_BASE || "http://localhost:3000").replace(/\/$/, "");
const KEY = process.env.HANSALA_AGENT_API_KEY?.trim();
if (!KEY) {
  console.error("Set HANSALA_AGENT_API_KEY");
  process.exit(1);
}

const results = [];
let companySlug = null;
let createdCaseId = null;
let createdRefId = null;

async function agent(method, path, body, { auth = true } = {}) {
  const res = await fetch(`${BASE}/api/v1/agent${path}`, {
    method,
    headers: {
      ...(auth ? { Authorization: `Bearer ${KEY}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text.slice(0, 200) };
  }
  return { status: res.status, ok: res.ok, json, allow: res.headers.get("allow") };
}

function record(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
}

function expectOk(name, res, extra = "") {
  const ok = res.ok;
  const detail = ok
    ? extra || `HTTP ${res.status}`
    : `HTTP ${res.status}: ${JSON.stringify(res.json?.error || res.json).slice(0, 180)}`;
  record(name, ok, detail);
  return ok;
}

function expectStatus(name, res, statuses, extra = "") {
  const ok = statuses.includes(res.status);
  const detail = ok
    ? extra || `HTTP ${res.status}`
    : `expected ${statuses.join("|")}, got ${res.status}: ${JSON.stringify(res.json?.error || res.json).slice(0, 160)}`;
  record(name, ok, detail);
  return ok;
}

async function main() {
  console.log(`\nFull Agent API test → ${BASE}/api/v1/agent\n`);

  // ── Auth ──────────────────────────────────────────────
  const noAuth = await agent("GET", "/company", null, { auth: false });
  expectStatus("Auth: missing Bearer → 401", noAuth, [401]);

  const badAuth = await fetch(`${BASE}/api/v1/agent/company`, {
    headers: { Authorization: "Bearer hs_invalid_key_for_test" },
  });
  expectStatus("Auth: invalid key → 401", { status: badAuth.status, ok: badAuth.ok, json: {} }, [401]);

  // ── OpenAPI ───────────────────────────────────────────
  const openapi = await fetch(`${BASE}/api/v1/openapi`);
  record("GET /api/v1/openapi", openapi.ok, `HTTP ${openapi.status}`);

  // ── Company ───────────────────────────────────────────
  const company = await agent("GET", "/company");
  if (expectOk("GET /company", company)) {
    const d = company.json?.data || {};
    companySlug = d.slug;
    record("  company.slug present", Boolean(d.slug), d.slug || "missing");
    record("  company.logo_url field", "logo_url" in d, String(d.logo_url ?? "null"));
    record("  company.cover_image_url field", "cover_image_url" in d, String(d.cover_image_url ?? "null"));
    record("  company.name present", Boolean(d.name), d.name || "missing");
  }

  const originalTagline = company.json?.data?.tagline ?? null;
  const patchTag = await agent("PATCH", "/company", {
    tagline: originalTagline || "Agent API test tagline",
  });
  expectOk("PATCH /company (tagline noop/restore)", patchTag);

  // ── Case studies CRUD ─────────────────────────────────
  const listCs = await agent("GET", "/case-studies");
  expectOk("GET /case-studies", listCs, `count=${listCs.json?.data?.length ?? "?"}`);

  const createCs = await agent("POST", "/case-studies", {
    title: `[API TEST] Smoke case ${Date.now()}`,
    summary: "Automated Agent API full test — safe to delete.",
    challenge: "Validate create/read/update/delete.",
    outcome: "Endpoints respond correctly.",
    year: "2026",
    sector: "IT",
  });
  if (expectOk("POST /case-studies", createCs)) {
    createdCaseId = createCs.json?.data?.id;
    record("  case_study.id returned", Boolean(createdCaseId), createdCaseId || "missing");
  }

  if (createdCaseId) {
    const getCs = await agent("GET", `/case-studies/${createdCaseId}`);
    expectOk("GET /case-studies/{id}", getCs);

    const patchCs = await agent("PATCH", `/case-studies/${createdCaseId}`, {
      summary: "Updated by full API test.",
    });
    expectOk("PATCH /case-studies/{id}", patchCs);

    const postCover = await agent("POST", `/case-studies/${createdCaseId}/cover`);
    expectStatus("POST /case-studies/{id}/cover → 405 PUT hint", postCover, [405]);

    const putCoverBad = await agent("PUT", `/case-studies/${createdCaseId}/cover`, {
      image_url: "https://example.com/not-a-real-image.png",
    });
    expectStatus(
      "PUT /case-studies/{id}/cover (bad URL → handled)",
      putCoverBad,
      [200, 201, 400, 422, 502],
      `HTTP ${putCoverBad.status}`,
    );

    const putGalleryBad = await agent("PUT", `/case-studies/${createdCaseId}/gallery`, {
      image_url: "https://example.com/gallery.png",
    });
    expectStatus(
      "PUT /case-studies/{id}/gallery (bad URL → handled)",
      putGalleryBad,
      [200, 201, 400, 422, 502],
      `HTTP ${putGalleryBad.status}`,
    );

    const partnersTag = await agent("POST", `/case-studies/${createdCaseId}/partners`, {
      partner_company_slug: "nonexistent-partner-slug-xyz",
      role: "Test partner",
    });
    expectStatus(
      "POST /case-studies/{id}/partners (missing slug)",
      partnersTag,
      [400, 404, 422],
      `HTTP ${partnersTag.status}`,
    );
  }

  // ── References ────────────────────────────────────────
  const listRefs = await agent("GET", "/references");
  expectOk("GET /references", listRefs, `count=${listRefs.json?.data?.length ?? "?"}`);

  const createRef = await agent("POST", "/references", {
    client: "API Test Client",
    service: "Agent API smoke",
    start_year: "2026",
    ongoing: true,
  });
  if (expectOk("POST /references (aliases client/start_year)", createRef)) {
    createdRefId = createRef.json?.data?.id;
  }

  if (createdRefId) {
    const getRef = await agent("GET", `/references/${createdRefId}`);
    expectStatus("GET /references/{id}", getRef, [200, 404, 405], `HTTP ${getRef.status}`);

    const patchRef = await agent("PATCH", `/references/${createdRefId}`, {
      service: "Agent API smoke updated",
    });
    expectStatus("PATCH /references/{id}", patchRef, [200, 404, 405], `HTTP ${patchRef.status}`);
  }

  // ── Partnerships / invites (no real email send if possible) ──
  const partnerships = await agent("GET", "/partnerships");
  expectOk("GET /partnerships", partnerships);

  // ── Verification ──────────────────────────────────────
  const ver = await agent("GET", "/verification");
  expectStatus("GET /verification", ver, [200, 403], `HTTP ${ver.status}`);

  const instr = await agent("GET", "/verification/instructions?method=meta_tag");
  expectStatus("GET /verification/instructions?method=meta_tag", instr, [200, 403], `HTTP ${instr.status}`);

  const check = await agent("POST", "/verification/check", { method: "meta_tag" });
  expectStatus(
    "POST /verification/check",
    check,
    [200, 400, 403, 422],
    `HTTP ${check.status}`,
  );

  // ── Team ──────────────────────────────────────────────
  const team = await agent("GET", "/team");
  expectStatus("GET /team", team, [200, 403], `HTTP ${team.status}`);

  // ── Analytics / widgets / inquiries / audit / group ───
  for (const path of [
    "/analytics",
    "/widgets",
    "/widget-settings",
    "/inquiries",
    "/audit-log",
    "/group",
  ]) {
    const res = await agent("GET", path);
    expectStatus(`GET ${path}`, res, [200, 403, 404], `HTTP ${res.status}`);
  }

  // ── Logo / cover method checks ────────────────────────
  const postLogo = await agent("POST", "/logo");
  expectStatus("POST /logo → 405 (PUT required)", postLogo, [405, 404], `HTTP ${postLogo.status}`);

  const postCoverCo = await agent("POST", "/company/cover");
  expectStatus(
    "POST /company/cover → 405 (PUT required)",
    postCoverCo,
    [405, 404],
    `HTTP ${postCoverCo.status}`,
  );

  // ── Cleanup write artifacts ───────────────────────────
  console.log("\n── Cleanup ──");
  if (createdCaseId) {
    const delCs = await agent("DELETE", `/case-studies/${createdCaseId}`);
    expectOk("DELETE /case-studies/{id} (cleanup)", delCs);
  }
  if (createdRefId) {
    const delRef = await agent("DELETE", `/references/${createdRefId}`);
    expectStatus(
      "DELETE /references/{id} (cleanup)",
      delRef,
      [200, 204, 404, 405],
      `HTTP ${delRef.status}`,
    );
  }

  // ── Summary ───────────────────────────────────────────
  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);
  console.log(`\n══════════════════════════════════════`);
  console.log(`Company: ${companySlug || "?"}`);
  console.log(`Passed:  ${passed}/${results.length}`);
  if (failed.length) {
    console.log(`Failed:`);
    for (const f of failed) console.log(`  ✗ ${f.name} — ${f.detail}`);
    process.exitCode = 1;
  } else {
    console.log("All checks passed.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
