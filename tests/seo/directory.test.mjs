import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function directoryLetter(name) {
  const ch = name.trim().charAt(0).toUpperCase();
  return ch >= "A" && ch <= "Z" ? ch : "#";
}

function directoryLetterSlug(letter) {
  return letter === "#" ? "other" : letter.toLowerCase();
}

function parseDirectoryLetterParam(raw) {
  const s = raw.trim().toLowerCase();
  if (s === "other") return "#";
  if (/^[a-z]$/.test(s)) return s.toUpperCase();
  return null;
}

test("letter hubs use path segments, not query pages", () => {
  assert.equal(directoryLetter("Vera"), "V");
  assert.equal(directoryLetterSlug("V"), "v");
  assert.equal(directoryLetterSlug("#"), "other");
  assert.equal(parseDirectoryLetterParam("v"), "V");
  assert.equal(parseDirectoryLetterParam("other"), "#");
  assert.equal(parseDirectoryLetterParam("page"), null);
});

test("anon directory select never filters revoked staff_hidden_at", () => {
  const src = readFileSync(
    join(root, "src/features/seo/directory-queries.ts"),
    "utf8",
  );
  assert.match(src, /DIRECTORY_COLUMNS = "slug, name, city, country"/);
  const publicFn = src.slice(
    src.indexOf("async function listPublicDirectory"),
    src.indexOf("export async function listDirectoryCatalog"),
  );
  assert.equal(publicFn.includes("listedCompanies"), false);
  assert.equal(publicFn.includes("staff_hidden_at"), false);
  assert.match(publicFn, /if \(error\) throw/);
  assert.match(src, /listedCompanies\(/);
  assert.match(src, /createAdminClient/);
});
