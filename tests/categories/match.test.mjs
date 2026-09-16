import assert from "node:assert/strict";
import test from "node:test";

/** Keep in sync with src/features/categories/match.ts */
const LEGAL = new Set(["gmbh", "ag", "kg", "ltd", "llc", "inc", "doo", "d.o.o", "plc", "co"]);

const NAMES = {
  architecture: "Architecture",
  cleaning: "Cleaning",
  construction: "Construction",
  "software-development": "Software development",
  consulting: "Consulting",
  "call-center": "Call center",
  agriculture: "Agriculture",
};

const ALIASES = {
  architekt: "architecture",
  architekturburo: "architecture",
  arhitektura: "architecture",
  reinigung: "cleaning",
  gebaudereinigung: "cleaning",
  "cleaning company": "cleaning",
  ciscenje: "cleaning",
  bau: "construction",
  baufirma: "construction",
  gradevina: "construction",
  "construction company": "construction",
  software: "software-development",
  "it software": "software-development",
  softwareentwicklung: "software-development",
  beratung: "consulting",
  "call centre": "call-center",
  "call center": "call-center",
  agriculture: "agriculture",
};

function fold(text) {
  return text
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function normalize(text) {
  const parts = fold(text).split(" ");
  while (parts.length > 1 && LEGAL.has(parts[parts.length - 1] ?? "")) parts.pop();
  return parts.join(" ");
}

function index() {
  const map = new Map();
  for (const [alias, slug] of Object.entries(ALIASES)) map.set(normalize(alias), slug);
  for (const [slug, name] of Object.entries(NAMES)) {
    map.set(normalize(name), slug);
    map.set(normalize(slug.replace(/-/g, " ")), slug);
  }
  return map;
}

const IDX = index();

function matchCategory(text) {
  const key = normalize(text);
  if (!key) return null;
  const hit = IDX.get(key);
  if (hit) {
    const foldedName = normalize(NAMES[hit] ?? "");
    return { slug: hit, confidence: key === foldedName ? "normalized" : "alias" };
  }
  let best = null;
  for (const [alias, slug] of IDX) {
    const a = new Set(key.split(" ").filter((t) => t.length >= 3));
    const b = new Set(alias.split(" ").filter((t) => t.length >= 3));
    if (a.size === 0 || b.size === 0) continue;
    let n = 0;
    for (const t of a) if (b.has(t)) n += 1;
    const score = n / a.size;
    if (score < 0.5) continue;
    if (!best || score > best.score) best = { slug, score };
  }
  return best ? { slug: best.slug, confidence: "token" } : null;
}

test("alias: German Reinigung → cleaning", () => {
  assert.deepEqual(matchCategory("Reinigung"), { slug: "cleaning", confidence: "alias" });
});

test("alias: Serbian čišćenje folds to cleaning", () => {
  assert.equal(matchCategory("Čišćenje").slug, "cleaning");
});

test("legal suffix GmbH is stripped", () => {
  assert.equal(matchCategory("Cleaning GmbH").slug, "cleaning");
});

test("canonical name is normalized confidence", () => {
  assert.deepEqual(matchCategory("Architecture"), {
    slug: "architecture",
    confidence: "normalized",
  });
});

test("IT - Software maps to software-development", () => {
  assert.equal(matchCategory("IT - Software").slug, "software-development");
});

test("unknown text is null — never invents a category", () => {
  assert.equal(matchCategory("flugelhorn merchants"), null);
  assert.equal(matchCategory(""), null);
});

test("token overlap still needs a real alias token", () => {
  const hit = matchCategory("cleaning services");
  assert.equal(hit?.slug, "cleaning");
  assert.equal(hit?.confidence, "token");
});

test("call center is the public name", () => {
  assert.equal(matchCategory("call centre").slug, "call-center");
  assert.equal(matchCategory("Call center").slug, "call-center");
  assert.equal(NAMES["call-center"], "Call center");
});

test("agriculture alias is not unmatched", () => {
  assert.equal(matchCategory("Agriculture").slug, "agriculture");
});
