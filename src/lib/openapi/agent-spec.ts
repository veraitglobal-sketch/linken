import { AGENT_OPENAPI_PATHS } from "@/lib/openapi/agent-paths";
import {
  OPENAPI_CONTACT,
  OPENAPI_DOCS,
  OPENAPI_LICENSE,
  OPENAPI_TERMS,
} from "@/lib/openapi/shared";

/** OpenAPI 3.1 discovery for Hansala Agent API v1. */
export function buildAgentOpenApi(siteUrl: string) {
  return {
    openapi: "3.1.0",
    info: {
      title: "Hansala Agent API",
      version: "1.1.0",
      summary: "Authenticated Agent API (Bearer hs_ keys).",
      description:
        "Bearer hs_ keys on every plan. PUT for image uploads (POST → 405). Agents invite only — never auto-confirm. Website widgets on a customer site still require Pro.",
      termsOfService: OPENAPI_TERMS,
      contact: OPENAPI_CONTACT,
      license: OPENAPI_LICENSE,
    },
    externalDocs: {
      description: "Developer docs, embeds, MCP",
      url: OPENAPI_DOCS,
    },
    servers: [{ url: `${siteUrl}/api/v1/agent` }],
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
