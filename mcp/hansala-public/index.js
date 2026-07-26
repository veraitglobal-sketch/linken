#!/usr/bin/env node
/**
 * Hansala Public MCP — keyless stdio server for verify + proof + widgets.
 *
 * Env (optional):
 *   HANSALA_API_BASE=https://www.hansala.com
 *
 * HANSALA_AGENT_API_KEY is intentionally ignored — this server never authenticates.
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { handleTool } from "./handlers.mjs";
import { TOOLS } from "./tools.mjs";

// Ignore agent keys if present — wrong audience for this server.
void process.env.HANSALA_AGENT_API_KEY;

const BASE = (
  process.env.HANSALA_API_BASE || "https://www.hansala.com"
).replace(/\/$/, "");

async function publicGet(path) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  if (res.status === 429) {
    const retry = res.headers.get("retry-after");
    throw new Error(
      retry
        ? `Rate limited by Hansala (429). Retry after ${retry}s.`
        : "Rate limited by Hansala (429). Wait a moment and try again.",
    );
  }
  if (!res.ok) {
    const msg = json?.error?.message || res.statusText || "Request failed";
    throw new Error(`GET ${path} → ${res.status}: ${msg}`);
  }
  return json;
}

const api = { publicGet, base: BASE };

const server = new Server(
  { name: "hansala-public", version: "0.1.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const data = await handleTool(
      request.params.name,
      request.params.arguments ?? {},
      api,
    );
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  } catch (err) {
    return {
      content: [
        {
          type: "text",
          text: err instanceof Error ? err.message : String(err),
        },
      ],
      isError: true,
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
