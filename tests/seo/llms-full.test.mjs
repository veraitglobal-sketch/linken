import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

test("llms-full lists per-company llm.md", () => {
  const src = readFileSync(
    join(root, "src/app/llms-full.txt/route.ts"),
    "utf8",
  );
  assert.match(src, /llm\.md/);
  assert.match(src, /listDirectoryCatalog/);
});

test("company sitemap includes llm.md", () => {
  const src = readFileSync(
    join(root, "src/features/sitemap/entries.ts"),
    "utf8",
  );
  assert.match(src, /\/c\/\$\{row\.slug\}\/llm\.md/);
});

test("sitemap lists letter directory URLs", () => {
  const src = readFileSync(
    join(root, "src/features/sitemap/directory-entries.ts"),
    "utf8",
  );
  assert.match(src, /\/companies\/\$\{directoryLetterSlug/);
});
