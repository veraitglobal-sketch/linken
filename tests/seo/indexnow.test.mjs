import assert from "node:assert/strict";
import test from "node:test";

function companyIndexNowUrls(site, slug) {
  const base = site.replace(/\/$/, "");
  const clean = slug.trim().replace(/^\/+|\/+$/g, "");
  if (!clean) return [];
  return [
    `${base}/c/${clean}`,
    `${base}/c/${clean}/partners`,
    `${base}/c/${clean}/llm.md`,
  ];
}

function canonicalCompanyWithPath(a, b) {
  return a.localeCompare(b) <= 0 ? `/c/${a}/with/${b}` : `/c/${b}/with/${a}`;
}

function partnershipIndexNowUrls(site, left, right) {
  const base = site.replace(/\/$/, "");
  const a = left.trim();
  const b = right.trim();
  if (!a || !b) return [];
  return [
    ...companyIndexNowUrls(base, a),
    ...companyIndexNowUrls(base, b),
    `${base}${canonicalCompanyWithPath(a, b)}`,
    `${base}/companies`,
  ];
}

function validKey(key) {
  return Boolean(key && /^[a-f0-9]{8,128}$/i.test(key));
}

test("company IndexNow URL is absolute profile path", () => {
  assert.deepEqual(
    companyIndexNowUrls("https://www.hansala.com", "vera-connect-group"),
    [
      "https://www.hansala.com/c/vera-connect-group",
      "https://www.hansala.com/c/vera-connect-group/partners",
      "https://www.hansala.com/c/vera-connect-group/llm.md",
    ],
  );
});

test("empty slug yields no URLs", () => {
  assert.deepEqual(companyIndexNowUrls("https://www.hansala.com", "  "), []);
});

test("confirmed pair ping includes the certificate URL", () => {
  const urls = partnershipIndexNowUrls(
    "https://www.hansala.com",
    "vera",
    "biovera",
  );
  assert.ok(urls.includes("https://www.hansala.com/c/biovera/with/vera"));
  assert.ok(urls.includes("https://www.hansala.com/companies"));
});

test("IndexNow key must be hex 8–128", () => {
  assert.equal(validKey("a5ff5f5e628a088047c537a9ba14e978"), true);
  assert.equal(validKey("short"), false);
  assert.equal(validKey("not-hex!!!"), false);
});
