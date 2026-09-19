import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

test("evidence page forbids hashing generated_at", () => {
  const src = readFileSync(
    join(root, "src/components/developers/evidence-doc.tsx"),
    "utf8",
  );
  assert.match(src, /generated_at/);
  assert.match(src, /confirmed_at/);
  assert.match(src, /Do not treat/);
  assert.doesNotMatch(src, /unverified|not verified/i);
});
