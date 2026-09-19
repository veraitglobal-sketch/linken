import { NextResponse } from "next/server";
import { MCP_CORS } from "@/features/mcp/cors";
import { getSiteUrl } from "@/lib/site";

export const MCP_PROTOCOL_VERSIONS = [
  "2025-06-18",
  "2025-03-26",
  "2024-11-05",
] as const;

function origin() {
  return getSiteUrl().replace(/\/$/, "");
}

export function mcpCatalog() {
  const site = origin();
  return {
    name: "Hansala MCP",
    transport: "streamable-http",
    docs: `${site}/developers#agent-mcp`,
    evidence: `${site}/developers/evidence`,
    serverCard: `${site}/server-card`,
    servers: [
      {
        name: "public",
        url: `${site}/api/mcp/public`,
        auth: "none",
      },
      {
        name: "agent",
        url: `${site}/api/mcp`,
        auth: "bearer",
      },
    ],
  };
}

/** SEP-2127 Server Card — public (keyless) plus Agent remote. */
export function mcpServerCard() {
  const site = origin();
  return {
    $schema:
      "https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json",
    name: "com.hansala/hansala",
    version: "1.0.0",
    title: "Hansala",
    description:
      "Confirmed work records. Public tools need no key; company tools use an hs_ API key.",
    websiteUrl: `${site}/developers`,
    icons: [
      {
        src: `${site}/brand/hansala-app-icon-128.png`,
        mimeType: "image/png",
        sizes: ["128x128"],
      },
    ],
    remotes: [
      {
        type: "streamable-http",
        url: `${site}/api/mcp/public`,
        supportedProtocolVersions: [...MCP_PROTOCOL_VERSIONS],
      },
      {
        type: "streamable-http",
        url: `${site}/api/mcp`,
        headers: [
          {
            name: "Authorization",
            description: "Bearer hs_ Agent API key for company tools.",
            isRequired: true,
            isSecret: true,
            placeholder: "Bearer hs_…",
          },
        ],
        supportedProtocolVersions: [...MCP_PROTOCOL_VERSIONS],
      },
    ],
  };
}

export function mcpDiscoveryJson(body: unknown) {
  return new NextResponse(JSON.stringify(body), {
    status: 200,
    headers: {
      ...MCP_CORS,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

export function mcpDiscoveryOptions() {
  return new NextResponse(null, { status: 204, headers: MCP_CORS });
}
