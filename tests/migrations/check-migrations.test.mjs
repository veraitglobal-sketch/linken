import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

/**
 * Migration hygiene — no live DB required.
 * npm run test:migrations
 */

const ROOT = join(import.meta.dirname, "../..");
const DIR = join(ROOT, "supabase/migrations");

function listMigrations() {
  return readdirSync(DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();
}

test("migrations use YYYYMMDDHHMMSS_name.sql naming", () => {
  const files = listMigrations();
  assert.ok(files.length > 0, "expected migrations");
  const pat = /^\d{14}_[a-z0-9_]+\.sql$/;
  for (const f of files) {
    assert.match(f, pat, `bad migration name: ${f}`);
  }
});

test("migration timestamps are unique and sorted", () => {
  const files = listMigrations();
  const stamps = files.map((f) => f.slice(0, 14));
  assert.equal(new Set(stamps).size, stamps.length, "duplicate timestamps");
  const sorted = [...stamps].sort();
  assert.deepEqual(stamps, sorted);
});

test("security hardening migration exists and tightens pending visibility", () => {
  const files = listMigrations();
  const hit = files.find((f) => f.includes("security_tenant_hardening"));
  assert.ok(hit, "missing security_tenant_hardening migration");
  const sql = readFileSync(join(DIR, hit), "utf8");
  assert.match(sql, /status = 'confirmed'/);
  assert.match(sql, /claim_company/);
  assert.match(sql, /invite_email/);
});

test("migrations stay under a reasonable size (review large dumps)", () => {
  for (const f of listMigrations()) {
    const bytes = statSync(join(DIR, f)).size;
    assert.ok(
      bytes < 500_000,
      `${f} is ${bytes} bytes — split or justify oversized migration`,
    );
  }
});

test("no migration drops companies table wholesale", () => {
  for (const f of listMigrations()) {
    const sql = readFileSync(join(DIR, f), "utf8").toLowerCase();
    assert.equal(
      /drop\s+table\s+(if\s+exists\s+)?public\.companies\b/.test(sql),
      false,
      `${f} drops companies`,
    );
  }
});
