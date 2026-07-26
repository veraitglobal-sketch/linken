import { PUBLIC_OPENAPI_PATHS } from "@/lib/openapi/public-paths";
import {
  OPENAPI_CONTACT,
  OPENAPI_DOCS,
  OPENAPI_LICENSE,
  OPENAPI_TERMS,
} from "@/lib/openapi/shared";

/** OpenAPI 3.1 for Hansala Public API v1 (open CORS, no key). */
export function buildPublicOpenApi(siteUrl: string) {
  return {
    openapi: "3.1.0",
    info: {
      title: "Hansala Public API",
      version: "1.0.0",
      summary: "Read-only confirmed company evidence. No API key.",
      description:
        "GET-only JSON. Confirmed facts only — never pending invites or private fields. Cache: public, s-maxage=300. Docs: https://www.hansala.com/developers",
      termsOfService: OPENAPI_TERMS,
      contact: OPENAPI_CONTACT,
      license: OPENAPI_LICENSE,
    },
    externalDocs: { description: "Developer docs", url: OPENAPI_DOCS },
    servers: [{ url: `${siteUrl}/api/v1` }],
    paths: PUBLIC_OPENAPI_PATHS,
    components: {
      parameters: {
        slug: {
          name: "slug",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Public company slug",
        },
        domain: {
          name: "domain",
          in: "query",
          required: true,
          schema: { type: "string" },
          description: "Website domain, e.g. example.com",
        },
      },
    },
  };
}
