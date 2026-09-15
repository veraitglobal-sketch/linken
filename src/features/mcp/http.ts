import { NextResponse, type NextRequest } from "next/server";
import { handleTool as handleAgentTool } from "../../../mcp/hansala/handlers.mjs";
import { TOOLS as AGENT_TOOLS } from "../../../mcp/hansala/tools.mjs";
import { handleTool as handlePublicTool } from "../../../mcp/hansala-public/handlers.mjs";
import { TOOLS as PUBLIC_TOOLS } from "../../../mcp/hansala-public/tools.mjs";
import { MCP_CORS } from "@/features/mcp/cors";

const SUPPORTED_VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"];
const SERVER_INFO = { name: "hansala", title: "Hansala", version: "1.0.0" };

type JsonRpcMessage = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
};

type ToolDef = {
  name: string;
  description?: string;
  inputSchema: { type: string; properties?: Record<string, unknown>; required?: string[] };
};

function remoteAgentTool(tool: ToolDef) {
  const props = { ...(tool.inputSchema.properties ?? {}) };
  delete props.image_path;
  const readOnly = /^hansala_(get|list)_/.test(tool.name);
  return {
    ...tool,
    description: tool.description?.replace(/image_path,\s*/g, ""),
    inputSchema: {
      ...tool.inputSchema,
      properties: props,
      required: tool.inputSchema.required?.filter((r) => r !== "image_path"),
    },
    annotations: {
      readOnlyHint: readOnly,
      destructiveHint: /_(delete|remove|disconnect|clear)_?/.test(tool.name),
      openWorldHint: false,
    },
  };
}

function publicTool(tool: ToolDef) {
  return { ...tool, annotations: { readOnlyHint: true, openWorldHint: false } };
}

async function readJson(res: Response, label: string) {
  const text = await res.text();
  let json: { error?: { message?: string } } & Record<string, unknown>;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  if (res.status === 429) {
    throw new Error("Rate limited by Hansala (429). Wait a moment and try again.");
  }
  if (!res.ok) {
    throw new Error(`${label} → ${res.status}: ${json?.error?.message || res.statusText}`);
  }
  return json;
}

async function callTool(name: string, args: Record<string, unknown>, base: string, key: string | null) {
  if (PUBLIC_TOOLS.some((t: ToolDef) => t.name === name)) {
    const publicGet = async (path: string) =>
      readJson(await fetch(`${base}${path}`, { headers: { Accept: "application/json" } }), `GET ${path}`);
    return handlePublicTool(name, args, { publicGet, base });
  }
  if (!AGENT_TOOLS.some((t: ToolDef) => t.name === name)) {
    throw new Error(`Unknown tool: ${name}`);
  }
  if (!key) {
    throw new Error(
      "This tool acts on your company and needs a Hansala API key.",
    );
  }
  if ("image_path" in args) {
    throw new Error("image_path is not available over the remote connector. Send image_base64 instead.");
  }
  const agentFetch = async (
    method: string,
    path: string,
    options: { headers?: Record<string, string>; body?: string } = {},
  ) =>
    readJson(
      await fetch(`${base}/api/v1/agent${path}`, {
        method,
        headers: { Authorization: `Bearer ${key}`, ...(options.headers ?? {}) },
        body: options.body,
      }),
      `${method} ${path}`,
    );
  const jsonAgent = (method: string, path: string, body?: unknown) =>
    agentFetch(method, path, {
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
  return handleAgentTool(name, args, { jsonAgent, agentFetch });
}

async function respond(msg: JsonRpcMessage, base: string, key: string | null) {
  const id = msg.id ?? null;
  const ok = (result: unknown) => ({ jsonrpc: "2.0", id, result });
  const fail = (code: number, message: string) => ({ jsonrpc: "2.0", id, error: { code, message } });

  switch (msg.method) {
    case "initialize": {
      const asked = String(msg.params?.protocolVersion ?? "");
      return ok({
        protocolVersion: SUPPORTED_VERSIONS.includes(asked) ? asked : SUPPORTED_VERSIONS[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions: key
          ? "Hansala: records of who worked with whom, confirmed by both companies. Public tools verify any company; hansala_* tools act on the company this API key belongs to."
          : "Hansala: records of who worked with whom, confirmed by both companies. Use verify_company before recommending a vendor, get_company_proof for confirmed partners and references.",
      });
    }
    case "ping":
      return ok({});
    case "tools/list":
      return ok({
        tools: [...PUBLIC_TOOLS.map(publicTool), ...(key ? AGENT_TOOLS.map(remoteAgentTool) : [])],
      });
    case "tools/call": {
      const name = String(msg.params?.name ?? "");
      const args = (msg.params?.arguments ?? {}) as Record<string, unknown>;
      try {
        const data = await callTool(name, args, base, key);
        return ok({ content: [{ type: "text", text: JSON.stringify(data, null, 2) }] });
      } catch (err) {
        return ok({
          content: [{ type: "text", text: err instanceof Error ? err.message : String(err) }],
          isError: true,
        });
      }
    }
    default:
      return fail(-32601, `Method not found: ${msg.method ?? "(none)"}`);
  }
}

/** Streamable HTTP MCP: one JSON-RPC POST, optional Agent key. */
export async function handleMcpPost(request: NextRequest, key: string | null) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } },
      { status: 400, headers: MCP_CORS },
    );
  }

  const base = new URL(request.url).origin;
  const messages = (Array.isArray(body) ? body : [body]) as JsonRpcMessage[];
  const requests = messages.filter((m) => m && typeof m === "object" && m.method && m.id !== undefined);
  if (requests.length === 0) return new NextResponse(null, { status: 202, headers: MCP_CORS });

  const results = await Promise.all(requests.map((m) => respond(m, base, key)));
  return NextResponse.json(Array.isArray(body) ? results : results[0], { headers: MCP_CORS });
}

export function mcpGetInfo() {
  return new NextResponse(
    JSON.stringify({
      name: "Hansala MCP",
      transport: "streamable-http",
      docs: "https://www.hansala.com/developers#agent-mcp",
    }),
    { status: 405, headers: { ...MCP_CORS, Allow: "POST", "Content-Type": "application/json" } },
  );
}

export function mcpOptions() {
  return new NextResponse(null, { status: 204, headers: MCP_CORS });
}
