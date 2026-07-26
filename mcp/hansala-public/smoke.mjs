#!/usr/bin/env node
/** Smoke test — run from unpacked package or mcp/hansala-public */
import { handleTool } from "./handlers.mjs";

const base = (process.env.HANSALA_API_BASE || "https://www.hansala.com").replace(
  /\/$/,
  "",
);

async function publicGet(path) {
  const res = await fetch(`${base}${path}`, {
    headers: { Accept: "application/json" },
    redirect: "follow",
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`${res.status}: non-JSON body: ${text.slice(0, 120)}`);
  }
  if (!res.ok) {
    throw new Error(`${res.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

const api = { publicGet, base };

const verify = await handleTool(
  "verify_company",
  { domain: "example.com" },
  api,
);
const snippet = await handleTool(
  "get_widget_snippet",
  { slug: "x", variant: "partner-wall" },
  api,
);

console.log(JSON.stringify({ verify, snippet }, null, 2));
