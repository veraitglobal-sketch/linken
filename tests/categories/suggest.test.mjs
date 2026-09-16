import assert from "node:assert/strict";
import test from "node:test";

/**
 * Mirrors src/features/categories/suggest.ts scoring enough to lock
 * "call centar" / "it software" behaviour without a TS loader.
 */
const NAMES = {
  "call-center": "Call center",
  "software-development": "Software development",
  "it-services": "IT services",
  cleaning: "Cleaning",
  architecture: "Architecture",
};

const ALIASES = {
  "call center": "call-center",
  "call centre": "call-center",
  "call centar": "call-center",
  callcentar: "call-center",
  bpo: "call-center",
  software: "software-development",
  "it software": "software-development",
  "it softver": "software-development",
  softver: "software-development",
  it: "it-services",
  reinigung: "cleaning",
  ciscenje: "cleaning",
};

const SPELL = { centar: "center", centre: "center", softver: "software" };

function fold(text) {
  return text
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function searchKey(text) {
  return fold(text)
    .split(" ")
    .map((t) => SPELL[t] ?? t)
    .join(" ")
    .trim();
}

function suggest(raw) {
  const query = searchKey(raw);
  if (!query) return [];
  const rows = Object.entries(NAMES).map(([slug, name]) => {
    const keys = new Set([searchKey(name), searchKey(slug.replace(/-/g, " "))]);
    for (const [alias, s] of Object.entries(ALIASES)) {
      if (s === slug) keys.add(searchKey(alias));
    }
    return { slug, name, keys: [...keys] };
  });
  const qTokens = query.split(" ").filter(Boolean);
  const scored = rows
    .map((row) => {
      let best = 0;
      for (const key of row.keys) {
        if (key === query) best = Math.max(best, 1000);
        if (key.startsWith(query)) best = Math.max(best, 800);
        if (query.length >= 3 && key.includes(query)) best = Math.max(best, 500);
        const kTokens = key.split(" ");
        let hits = 0;
        for (const qt of qTokens) {
          if (kTokens.some((kt) => kt === qt || kt.startsWith(qt) || (qt.length >= 3 && kt.includes(qt)))) {
            hits += 1;
          }
        }
        if (hits === qTokens.length) best = Math.max(best, 400);
      }
      return { slug: row.slug, score: best };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.map((r) => r.slug);
}

test("call centar suggests Call center", () => {
  assert.equal(suggest("call centar")[0], "call-center");
});

test("it software suggests Software development", () => {
  assert.equal(suggest("it software")[0], "software-development");
});

test("softver suggests Software development", () => {
  assert.ok(suggest("softver").includes("software-development"));
});

test("ciscenje suggests Cleaning", () => {
  assert.equal(suggest("ciscenje")[0], "cleaning");
});
