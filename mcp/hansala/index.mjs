#!/usr/bin/env node
/**
 * Hansala Agent MCP — stdio server wrapping /api/v1/agent/*
 *
 * Env:
 *   HANSALA_AGENT_API_KEY=hs_...
 *   HANSALA_API_BASE=https://hansala.com
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { handleTool } from "./handlers.mjs";
import { TOOLS } from "./tools.mjs";

const BASE = (process.env.HANSALA_API_BASE || "https://hansala.com").replace(
  /\/$/,
  "",
);
const KEY = process.env.HANSALA_AGENT_API_KEY?.trim();

function requireKey() {
  if (!KEY) {
    throw new Error(
      "HANSALA_AGENT_API_KEY is not set. Create an API key in Dashboard → API.",
    );
  }
}

async function agentFetch(method, path, options = {}) {
  requireKey();
  const url = `${BASE}/api/v1/agent${path}`;
  const headers = { Authorization: `Bearer ${KEY}`, ...(options.headers ?? {}) };
  const res = await fetch(url, { method, headers, body: options.body });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    const msg = json?.error?.message || res.statusText;
    throw new Error(`${method} ${path} → ${res.status}: ${msg}`);
  }
  return json;
}

async function jsonAgent(method, path, body) {
  return agentFetch(method, path, {
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

const api = { jsonAgent, agentFetch };

const server = new Server(
  { name: "hansala", version: "0.2.0" },
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
