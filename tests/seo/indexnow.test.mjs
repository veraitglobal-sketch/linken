import assert from "node:assert/strict";
import test from "node:test";

function companyIndexNowUrls(site, slug) {
  const base = site.replace(/\/$/, "");
  const clean = slug.trim().replace(/^\/+|\/+$/g, "");
  if (!clean) return [];
  return [`${base}/c/${clean}`];
}

function validKey(key) {
  return Boolean(key && /^[a-f0-9]{8,128}$/i.test(key));
}

test("company IndexNow URL is absolute profile path", () => {
  assert.deepEqual(companyIndexNowUrls("https://hansala.com", "vera-connect-group"), [
    "https://hansala.com/c/vera-connect-group",
  ]);
});

test("empty slug yields no URLs", () => {
  assert.deepEqual(companyIndexNowUrls("https://hansala.com", "  "), []);
});

test("IndexNow key must be hex 8–128", () => {
  assert.equal(validKey("a5ff5f5e628a088047c537a9ba14e978"), true);
  assert.equal(validKey("short"), false);
  assert.equal(validKey("not-hex!!!"), false);
});
