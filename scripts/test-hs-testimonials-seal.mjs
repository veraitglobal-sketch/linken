/**
 * Structural proof: hs-testimonials.js keeps seal + provenance out of host CSS.
 * Run: node scripts/test-hs-testimonials-seal.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(join(root, "public/hs-testimonials.js"), "utf8");

const checks = [
  ["attachShadow", /attachShadow\(\s*\{\s*mode:\s*["']open["']/],
  ["hs-tm-seal in card", /class="hs-tm-seal"/],
  ["hs-tm-prov always", /hs-tm-prov/],
  ["hs-tm-attribution", /hs-tm-attribution/],
  ["fallback Confirmed on Hansala", /Confirmed on Hansala/],
  ["no optional provenance skip", /provenance_line[\s\S]*\?[\s\S]*hs-tm-prov[\s\S]*:[\s\S]*""/],
];

let failed = 0;
for (const [name, re] of checks) {
  // Last check: ensure we do NOT skip provenance when missing (old pattern)
  if (name.startsWith("no optional")) {
    const bad = /provenance_line\s*\?\s*[^:]+:\s*""/;
    if (bad.test(src)) {
      console.error("FAIL:", name, "— empty provenance branch still present");
      failed++;
    } else {
      console.log("OK:", name);
    }
    continue;
  }
  if (re.test(src)) {
    console.log("OK:", name);
  } else {
    console.error("FAIL:", name);
    failed++;
  }
}

if (failed) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log("\nAll seal structural checks passed.");
