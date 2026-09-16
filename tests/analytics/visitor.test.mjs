import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

const src = readFileSync(new URL("../../src/features/analytics/visitor.ts", import.meta.url), "utf8");
const js = src
  .replace(/^import .*\n/gm, "")
  .replace(/: Record<string, string>/g, "")
  .replace(/: string \| null \| undefined/g, "")
  .replace(/: Headers/g, "")
  .replace(/: string/g, "")
  .replace(/: boolean/g, "")
  .replace(/^export /gm, "");

const {
  isAnalyticsBot,
  isPrefetchRequest,
  visitorHash,
  aliasProfileSource,
} = new Function("createHash", `${js}; return { isAnalyticsBot, isPrefetchRequest, visitorHash, aliasProfileSource };`)(
  createHash,
);

test("crawlers are not visits", () => {
  assert.equal(isAnalyticsBot("Mozilla/5.0 (compatible; Googlebot/2.1)"), true);
  assert.equal(isAnalyticsBot("facebookexternalhit/1.1"), true);
  assert.equal(isAnalyticsBot("Mozilla/5.0 (Macintosh) Chrome/120"), false);
  assert.equal(isAnalyticsBot(""), false);
});

test("Next prefetch is not a visit", () => {
  assert.equal(isPrefetchRequest(new Headers({ "next-router-prefetch": "1" })), true);
  assert.equal(isPrefetchRequest(new Headers({ purpose: "prefetch" })), true);
  assert.equal(isPrefetchRequest(new Headers({ "user-agent": "Chrome" })), false);
});

test("same visitor hashes the same", () => {
  const a = visitorHash("1.2.3.4", "Chrome", "salt");
  const b = visitorHash("1.2.3.4", "Chrome", "salt");
  const c = visitorHash("1.2.3.5", "Chrome", "salt");
  assert.equal(a, b);
  assert.notEqual(a, c);
  assert.equal(a.length, 32);
});

test("tagged sources are not dumped into direct", () => {
  assert.equal(aliasProfileSource("ranking"), "search");
  assert.equal(aliasProfileSource("testimonial"), "partner");
  assert.equal(aliasProfileSource("search"), "search");
});
