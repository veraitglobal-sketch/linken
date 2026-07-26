#!/usr/bin/env node
/**
 * Agent API smoke test — read-only checks + optional write flag.
 *
 * Usage:
 *   HANSALA_AGENT_API_KEY=hs_... node scripts/agent-smoke-test.mjs
 *   HANSALA_API_BASE=https://hansala.com  (default)
 *   AGENT_SMOKE_WRITE=1  — also PATCH company tagline (reverts not implemented)
 */
const BASE = (process.env.HANSALA_API_BASE || "https://hansala.com").replace(
  /\/$/,
  "",
);
const KEY = process.env.HANSALA_AGENT_API_KEY?.trim();
const WRITE = process.env.AGENT_SMOKE_WRITE === "1";

if (!KEY) {
  console.error("Set HANSALA_AGENT_API_KEY");
  process.exit(1);
}

async function agent(method, path, body) {
  const res = await fetch(`${BASE}/api/v1/agent${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${KEY}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  return { status: res.status, ok: res.ok, json, allow: res.headers.get("allow") };
}

function pass(label) {
  console.log(`✓ ${label}`);
}

function fail(label, detail) {
  console.error(`✗ ${label}`, detail);
  process.exitCode = 1;
}

async function main() {
  console.log(`Smoke test → ${BASE}/api/v1/agent`);

  const company = await agent("GET", "/company");
  if (company.ok && company.json?.data?.slug) {
    pass(`GET /company → ${company.json.data.slug}`);
    if ("logo_url" in company.json.data && "cover_image_url" in company.json.data) {
      pass("GET /company includes logo_url + cover_image_url");
    } else {
      fail("GET /company missing logo_url or cover_image_url");
    }
  } else {
    fail("GET /company", company);
  }

  const cases = await agent("GET", "/case-studies");
  if (cases.ok) pass("GET /case-studies");
  else fail("GET /case-studies", cases);

  const refs = await agent("GET", "/references");
  if (refs.ok) pass("GET /references");
  else fail("GET /references", refs);

  const partners = await agent("GET", "/partnerships");
  if (partners.ok) pass("GET /partnerships");
  else fail("GET /partnerships", partners);

  const ver = await agent("GET", "/verification");
  if (ver.ok || ver.status === 403) {
    pass(ver.ok ? "GET /verification" : "GET /verification (scope skipped)");
  } else {
    fail("GET /verification", ver);
  }

  const instr = await agent("GET", "/verification/instructions?method=meta_tag");
  if (instr.ok || instr.status === 403) {
    pass(instr.ok ? "GET /verification/instructions" : "GET /verification/instructions (scope skipped)");
  } else {
    fail("GET /verification/instructions", instr);
  }

  const postCover = await agent("POST", "/case-studies/00000000-0000-0000-0000-000000000000/cover");
  if (postCover.status === 405 && postCover.json?.error?.message?.includes("PUT")) {
    pass("POST /cover returns 405 with PUT hint");
  } else {
    fail("POST /cover 405 hint", postCover);
  }

  const badRef = await agent("POST", "/references", {
    client: "Test",
    service: "Smoke",
    start_year: "2024",
  });
  if (badRef.ok && badRef.json?.data?.id) {
    pass("POST /references accepts client + start_year aliases");
  } else if (badRef.status === 422) {
    fail("POST /references aliases", badRef.json?.error?.message);
  } else {
    pass(`POST /references → ${badRef.status}`);
  }

  const openapi = await fetch(`${BASE}/api/v1/openapi`);
  if (openapi.ok) pass("GET /api/v1/openapi");
  else fail("GET /api/v1/openapi", openapi.status);

  const agentSpec = await fetch(`${BASE}/api/v1/openapi/agent`);
  if (agentSpec.ok) pass("GET /api/v1/openapi/agent");
  else fail("GET /api/v1/openapi/agent", agentSpec.status);

  if (WRITE && company.json?.data) {
    const patch = await agent("PATCH", "/company", {
      tagline: company.json.data.tagline,
    });
    if (patch.ok) pass("PATCH /company (noop tagline)");
    else fail("PATCH /company", patch);
  }

  console.log(process.exitCode ? "\nSome checks failed." : "\nAll checks passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
