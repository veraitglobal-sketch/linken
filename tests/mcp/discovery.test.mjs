import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

test("MCP catalog points at hosted public and Agent URLs", () => {
  const src = readFileSync(join(root, "src/features/mcp/discovery.ts"), "utf8");
  assert.match(src, /api\/mcp\/public/);
  assert.match(src, /server-card\.schema\.json/);
  assert.match(src, /com\.hansala\/hansala/);
  assert.match(src, /developers\/evidence/);
});

test("well-known and /server-card routes exist", () => {
  const catalog = readFileSync(
    join(root, "src/app/.well-known/mcp/route.ts"),
    "utf8",
  );
  const card = readFileSync(join(root, "src/app/server-card/route.ts"), "utf8");
  const nested = readFileSync(
    join(root, "src/app/.well-known/mcp/server-card.json/route.ts"),
    "utf8",
  );
  assert.match(catalog, /mcpCatalog/);
  assert.match(card, /mcpServerCard/);
  assert.match(nested, /mcpServerCard/);
});
