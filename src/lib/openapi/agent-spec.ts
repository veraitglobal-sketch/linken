import { AGENT_OPENAPI_PATHS } from "@/lib/openapi/agent-paths";

/** Build OpenAPI 3.1 discovery for Hansala Agent API v1. */
export function buildAgentOpenApi(siteUrl: string) {
  const base = `${siteUrl}/api/v1/agent`;
  return {
    openapi: "3.1.0",
    info: {
      title: "Hansala Agent API",
      version: "1.1.0",
      summary: "Authenticated Agent API for Pro companies (Bearer hs_ keys).",
      description:
        "Pro plan. Bearer hs_ keys. Image uploads use PUT (POST → 405). Agents invite only — never auto-confirm. Free keys → 403 plan_required. Human docs: https://www.hansala.com/developers",
      termsOfService: "https://www.hansala.com/developers/api-terms",
      contact: {
        name: "Hansala Developers",
        url: "https://www.hansala.com/developers",
        email: "developers@hansala.com",
      },
      license: { name: "Proprietary", url: "https://www.hansala.com/terms" },
    },
    externalDocs: {
      description: "Developer docs, embeds, MCP",
      url: "https://www.hansala.com/developers",
    },
    servers: [{ url: base }],
    security: [{ bearerAuth: [] }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "hs_",
          description: "Create in Workspace → API. Shown once; stored hashed.",
        },
      },
    },
    paths: AGENT_OPENAPI_PATHS,
  };
}
