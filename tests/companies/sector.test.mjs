import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function asCompanySector(raw) {
  const value = String(raw ?? "").trim();
  if (!value || /^client$/i.test(value)) return "";
  return value;
}

function asPublicCompanyText(kind, raw) {
  const value = String(raw ?? "").trim();
  if (!value) return "";
  if (kind === "tagline" && /^client of\s/i.test(value)) return "";
  if (
    kind === "description" &&
    /^Draft profile created from a service reference by /.test(value)
  ) {
    return "";
  }
  return value;
}

test("Client is not a company sector", () => {
  assert.equal(asCompanySector("Client"), "");
  assert.equal(asCompanySector("client"), "");
  assert.equal(asCompanySector("Software"), "Software");
});

test("role stamp is not the company's own copy", () => {
  assert.equal(asPublicCompanyText("tagline", "Client of Vera"), "");
  assert.equal(
    asPublicCompanyText(
      "description",
      "Draft profile created from a service reference by Vera.",
    ),
    "",
  );
  assert.equal(asPublicCompanyText("tagline", "Registry of confirmed work"), "Registry of confirmed work");
});

test("ghost client insert does not stamp sector Client", () => {
  const src = readFileSync(
    join(root, "src/features/references/core.ts"),
    "utf8",
  );
  assert.equal(/category:\s*"Client"/.test(src), false);
  assert.equal(/Client of \$\{/.test(src), false);
  const minimal = readFileSync(
    join(root, "src/features/company/minimal-actions.ts"),
    "utf8",
  );
  assert.equal(/category:\s*"Client"/.test(minimal), false);
});
