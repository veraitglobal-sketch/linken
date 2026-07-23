#!/usr/bin/env node
/**
 * Hansala Agent MCP — stdio server wrapping /api/v1/agent/*
 *
 * Env:
 *   HANSALA_AGENT_API_KEY=hs_...
 *   HANSALA_API_BASE=https://hansala.com  (or http://localhost:3000)
 */
import { readFile } from "node:fs/promises";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const BASE = (process.env.HANSALA_API_BASE || "http://localhost:3000").replace(
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
  const headers = {
    Authorization: `Bearer ${KEY}`,
    ...(options.headers ?? {}),
  };
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

async function loadImageInput(args) {
  if (args.image_base64) {
    const raw = String(args.image_base64).replace(/^data:[^;]+;base64,/, "");
    return {
      bytes: Buffer.from(raw, "base64"),
      contentType: args.content_type || "image/jpeg",
    };
  }
  if (args.image_path) {
    const bytes = await readFile(String(args.image_path));
    const ext = String(args.image_path).split(".").pop()?.toLowerCase();
    const contentType =
      args.content_type ||
      (ext === "png"
        ? "image/png"
        : ext === "webp"
          ? "image/webp"
          : "image/jpeg");
    return { bytes, contentType };
  }
  throw new Error("Provide image_path or image_base64.");
}

async function uploadImage(method, path, args) {
  const { bytes, contentType } = await loadImageInput(args);
  return agentFetch(method, path, {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image_base64: bytes.toString("base64"),
      content_type: contentType,
    }),
  });
}

const TOOLS = [
  {
    name: "hansala_get_company",
    description: "Read the authenticated company profile and trust summary.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "hansala_update_company",
    description: "Update company profile fields (tagline, description, services, location, social links).",
    inputSchema: {
      type: "object",
      properties: {
        tagline: { type: "string" },
        description: { type: "string" },
        services: { type: "array", items: { type: "string" } },
        city: { type: "string" },
        country: { type: "string" },
        website: { type: "string" },
        accepting_clients: { type: "boolean" },
        linkedin_url: { type: "string" },
        facebook_url: { type: "string" },
      },
      additionalProperties: false,
    },
  },
  {
    name: "hansala_list_case_studies",
    description: "List all case studies for the company (full dossier fields).",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "hansala_get_case_study",
    description: "Get one case study by UUID.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string", description: "Case study UUID" } },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    name: "hansala_create_case_study",
    description: "Create a case study dossier (text fields). Upload photos separately.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        summary: { type: "string" },
        challenge: { type: "string" },
        outcome: { type: "string" },
        process: { type: "string" },
        location: { type: "string" },
        year: { type: "string" },
        duration: { type: "string" },
        sector: { type: "string" },
        scope: { type: "string" },
        client_label: { type: "string" },
        highlight_stat: { type: "string" },
        client_quote: { type: "string" },
        services: { type: "array", items: { type: "string" } },
        metrics: {
          type: "array",
          items: {
            type: "object",
            properties: { label: { type: "string" }, value: { type: "string" } },
            required: ["label", "value"],
          },
        },
      },
      required: ["title", "summary"],
      additionalProperties: false,
    },
  },
  {
    name: "hansala_update_case_study",
    description: "Update case study content fields by UUID.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        title: { type: "string" },
        summary: { type: "string" },
        challenge: { type: "string" },
        outcome: { type: "string" },
        process: { type: "string" },
        location: { type: "string" },
        year: { type: "string" },
        duration: { type: "string" },
        sector: { type: "string" },
        scope: { type: "string" },
        client_label: { type: "string" },
        highlight_stat: { type: "string" },
        client_quote: { type: "string" },
        services: { type: "array", items: { type: "string" } },
        metrics: {
          type: "array",
          items: {
            type: "object",
            properties: { label: { type: "string" }, value: { type: "string" } },
            required: ["label", "value"],
          },
        },
      },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    name: "hansala_upload_case_study_cover",
    description: "Upload cover photo for a case study (image_path or image_base64).",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        image_path: { type: "string", description: "Absolute path to JPG/PNG/WEBP" },
        image_base64: { type: "string" },
        content_type: { type: "string" },
      },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    name: "hansala_upload_case_study_gallery",
    description: "Add one gallery photo to a case study.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        image_path: { type: "string" },
        image_base64: { type: "string" },
        content_type: { type: "string" },
      },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    name: "hansala_request_client_confirmation",
    description: "Email client to confirm a case study (human must click link).",
    inputSchema: {
      type: "object",
      properties: {
        case_study_slug: { type: "string" },
        email: { type: "string" },
      },
      required: ["case_study_slug", "email"],
      additionalProperties: false,
    },
  },
  {
    name: "hansala_list_team",
    description: "List team members and pending invitations.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "hansala_invite_team_member",
    description: "Invite a teammate (they accept via email link).",
    inputSchema: {
      type: "object",
      properties: {
        first_name: { type: "string" },
        last_name: { type: "string" },
        title: { type: "string" },
        email: { type: "string" },
        role: { type: "string", enum: ["admin", "member"] },
        permissions: {
          type: "array",
          items: { type: "string" },
          description: "Section ids for members: network, widgets, inbox, etc.",
        },
      },
      required: ["first_name", "last_name", "email"],
      additionalProperties: false,
    },
  },
  {
    name: "hansala_update_team_member",
    description: "Update member profile, role, or section permissions.",
    inputSchema: {
      type: "object",
      properties: {
        member_id: { type: "string" },
        display_name: { type: "string" },
        display_title: { type: "string" },
        public_visible: { type: "boolean" },
        role: { type: "string", enum: ["admin", "member"] },
        permissions: { type: "array", items: { type: "string" } },
      },
      required: ["member_id"],
      additionalProperties: false,
    },
  },
  {
    name: "hansala_upload_team_member_photo",
    description: "Upload avatar for a team member by member_id.",
    inputSchema: {
      type: "object",
      properties: {
        member_id: { type: "string" },
        image_path: { type: "string" },
        image_base64: { type: "string" },
        content_type: { type: "string" },
      },
      required: ["member_id"],
      additionalProperties: false,
    },
  },
  {
    name: "hansala_upload_logo",
    description: "Upload company logo (image_path or image_base64).",
    inputSchema: {
      type: "object",
      properties: {
        image_path: { type: "string" },
        image_base64: { type: "string" },
        content_type: { type: "string" },
      },
      additionalProperties: false,
    },
  },
];

async function handleTool(name, args) {
  switch (name) {
    case "hansala_get_company":
      return jsonAgent("GET", "/company");
    case "hansala_update_company":
      return jsonAgent("PATCH", "/company", args);
    case "hansala_list_case_studies":
      return jsonAgent("GET", "/case-studies");
    case "hansala_get_case_study":
      return jsonAgent("GET", `/case-studies/${args.id}`);
    case "hansala_create_case_study":
      return jsonAgent("POST", "/case-studies", args);
    case "hansala_update_case_study": {
      const { id, ...body } = args;
      return jsonAgent("PATCH", `/case-studies/${id}`, body);
    }
    case "hansala_upload_case_study_cover":
      return uploadImage("PUT", `/case-studies/${args.id}/cover`, args);
    case "hansala_upload_case_study_gallery":
      return uploadImage("PUT", `/case-studies/${args.id}/gallery`, args);
    case "hansala_request_client_confirmation":
      return jsonAgent("POST", "/client-confirmations", args);
    case "hansala_list_team":
      return jsonAgent("GET", "/team");
    case "hansala_invite_team_member":
      return jsonAgent("POST", "/team/invitations", args);
    case "hansala_update_team_member": {
      const { member_id, ...body } = args;
      return jsonAgent("PATCH", `/team/members/${member_id}`, body);
    }
    case "hansala_upload_team_member_photo":
      return uploadImage("PUT", `/team/members/${args.member_id}/photo`, args);
    case "hansala_upload_logo":
      return uploadImage("PUT", "/logo", args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

const server = new Server(
  { name: "hansala", version: "0.1.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const data = await handleTool(request.params.name, request.params.arguments ?? {});
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
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
