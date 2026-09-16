import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/**
 * Ranking points — the rules that decide a position, tested against the real
 * source. Node 20 cannot import TypeScript, so the module is stripped of its
 * types and evaluated here: no second copy of the logic to drift from.
 */

const src = readFileSync(new URL("../../src/features/ranking/score.ts", import.meta.url), "utf8");
const js = src
  .replace(/^export type [\s\S]*?^};$/gm, "")
  .replace(/^export type .*;$/gm, "")
  .replace(/: Record<[^>]+>/g, "")
  .replace(/: RankRecord\[\]/g, "")
  .replace(/: RankRecord\b/g, "")
  .replace(/: RankResult\b/g, "")
  .replace(/: RankRecordKind\b/g, "")
  .replace(/: string \| Date \| null/g, "")
  .replace(/: Date\b/g, "")
  .replace(/: number\b/g, "")
  .replace(/: string\b/g, "")
  .replace(/new Map<[^>]+>\(\)/g, "new Map()")
  .replace(/new Set<[^>]+>\(\)/g, "new Set()")
  .replace(/^export /gm, "");

const module = new Function(`${js}; return { computeRankPoints, recencyWeight, COUNTERPARTY_CAP, MIN_RANKED_FOR_POSITIONS };`)();
const { computeRankPoints, recencyWeight, COUNTERPARTY_CAP, MIN_RANKED_FOR_POSITIONS } = module;

const NOW = new Date("2026-09-16T00:00:00Z");
const ago = (months) => new Date(NOW.getTime() - months * 30.44 * 24 * 3600 * 1000).toISOString();

const partner = (id, opts = {}) => ({
  kind: "partner",
  counterpartyId: id,
  counterpartyVerified: true,
  confirmedAt: ago(1),
  ...opts,
});

test("a verified, recent partner is worth its base points", () => {
  const { points } = computeRankPoints([partner("a")], NOW);
  assert.equal(points, 2);
});

test("an unverified counterparty counts for less", () => {
  const { points } = computeRankPoints([partner("a", { counterpartyVerified: false })], NOW);
  assert.equal(points, 0.8);
});

test("older confirmations decay, the record still counts", () => {
  assert.equal(recencyWeight(ago(6), NOW), 1);
  assert.equal(recencyWeight(ago(18), NOW), 0.7);
  assert.equal(recencyWeight(ago(30), NOW), 0.45);
  assert.equal(recencyWeight(ago(60), NOW), 0.25);
  const { points, confirmedRecords } = computeRankPoints([partner("a", { confirmedAt: ago(60) })], NOW);
  assert.equal(points, 0.5);
  assert.equal(confirmedRecords, 1);
});

test("one counterparty cannot lift a company past the cap", () => {
  const many = Array.from({ length: 12 }, () => ({
    kind: "case_client",
    counterpartyId: "loop-partner",
    counterpartyVerified: true,
    confirmedAt: ago(1),
  }));
  const { points, distinctPartners } = computeRankPoints(many, NOW);
  assert.equal(points, COUNTERPARTY_CAP);
  assert.equal(distinctPartners, 1);
});

test("different companies each bring their own points", () => {
  const { points, distinctPartners } = computeRankPoints(
    [partner("a"), partner("b"), partner("c")],
    NOW,
  );
  assert.equal(points, 6);
  assert.equal(distinctPartners, 3);
});

test("a testimonial from a free mailbox is worth nothing", () => {
  const { points } = computeRankPoints(
    [
      {
        kind: "testimonial",
        counterpartyId: "a",
        counterpartyVerified: true,
        confirmedAt: ago(1),
        attached: true,
        authorFreeMail: true,
      },
    ],
    NOW,
  );
  assert.equal(points, 0);
});

test("a testimonial not attached to a confirmed record counts a quarter", () => {
  const base = {
    kind: "testimonial",
    counterpartyId: "a",
    counterpartyVerified: true,
    confirmedAt: ago(1),
  };
  assert.equal(computeRankPoints([{ ...base, attached: true }], NOW).points, 1);
  assert.equal(computeRankPoints([{ ...base, attached: false }], NOW).points, 0.25);
});

test("records with no counterparty profile share one capped bucket", () => {
  const ghosts = Array.from({ length: 10 }, () => ({
    kind: "reference",
    counterpartyId: null,
    counterpartyVerified: false,
    confirmedAt: ago(1),
  }));
  const { points, distinctPartners } = computeRankPoints(ghosts, NOW);
  assert.equal(points, COUNTERPARTY_CAP);
  assert.equal(distinctPartners, 0);
});

test("no records means no points, never a negative", () => {
  const r = computeRankPoints([], NOW);
  assert.deepEqual(r, { points: 0, distinctPartners: 0, confirmedRecords: 0, lastConfirmedAt: null });
});

test("positions need a real field", () => {
  assert.equal(MIN_RANKED_FOR_POSITIONS, 5);
});
