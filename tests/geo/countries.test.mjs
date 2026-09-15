import assert from "node:assert/strict";
import test from "node:test";

const COUNTRIES = [
  { code: "DE", name: "Germany" },
  { code: "RS", name: "Serbia" },
  { code: "AT", name: "Austria" },
  { code: "GB", name: "United Kingdom" },
];

const ALIASES = {
  deutschland: "DE",
  germany: "DE",
  de: "DE",
  serbia: "RS",
  srbija: "RS",
  uk: "GB",
  "united kingdom": "GB",
};

function fold(text) {
  return text
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function matchCountry(text) {
  const raw = text.trim();
  if (!raw) return null;
  if (/^[A-Za-z]{2}$/.test(raw)) {
    const c = raw.toUpperCase();
    return COUNTRIES.find((row) => row.code === c) ?? null;
  }
  const key = fold(raw);
  const aliased = ALIASES[key];
  if (aliased) return COUNTRIES.find((row) => row.code === aliased) ?? null;
  return COUNTRIES.find((row) => fold(row.name) === key) ?? null;
}

test("ISO code DE", () => {
  assert.equal(matchCountry("DE")?.code, "DE");
});

test("Deutschland → Germany", () => {
  assert.deepEqual(matchCountry("Deutschland"), { code: "DE", name: "Germany" });
});

test("Srbija → Serbia", () => {
  assert.equal(matchCountry("Srbija")?.code, "RS");
});

test("unknown country is null", () => {
  assert.equal(matchCountry("Narnia"), null);
});
