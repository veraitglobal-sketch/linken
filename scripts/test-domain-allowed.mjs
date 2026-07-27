import assert from "node:assert/strict";
import test from "node:test";
import { getDomain } from "tldts";

/** Minimal copy of production logic for node:test (no TS path aliases). */
function extractDomain(website) {
  const raw = website.trim().toLowerCase();
  if (!raw) return null;
  let host = raw;
  try {
    if (host.includes("://")) host = new URL(host).hostname;
    else host = (host.split("/")[0] ?? "").split("?")[0]?.split("#")[0] ?? "";
  } catch {
    return null;
  }
  host = host.replace(/\.$/, "");
  if (host.startsWith("www.")) host = host.slice(4);
  if (!host || host === "localhost") return null;
  if (!/^([a-z0-9-]+\.)+[a-z0-9-]+$/.test(host)) return null;
  return host;
}

function allowedEmailDomainsForWebsite(website) {
  const host = extractDomain(website);
  if (!host) return [];
  const registrable = getDomain(host, { allowPrivateDomains: true }) ?? host;
  const out = [];
  let current = host;
  while (true) {
    out.push(current);
    if (current === registrable) break;
    const dot = current.indexOf(".");
    if (dot < 0) break;
    current = current.slice(dot + 1);
  }
  return out;
}

function expectAllowed(website, expected) {
  assert.deepEqual(allowedEmailDomainsForWebsite(website), expected);
}

test("allowed email domains — parent acceptance", () => {
  expectAllowed("https://agentur.verait.de", [
    "agentur.verait.de",
    "verait.de",
  ]);
  expectAllowed("verait.de", ["verait.de"]);
  expectAllowed("https://firma.co.uk", ["firma.co.uk"]);
  expectAllowed("https://mojafirma.github.io", ["mojafirma.github.io"]);
  expectAllowed("https://app.firma.wixsite.com", [
    "app.firma.wixsite.com",
    "firma.wixsite.com",
  ]);
});
