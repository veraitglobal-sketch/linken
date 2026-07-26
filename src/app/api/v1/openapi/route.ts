import { getSiteUrl } from "@/lib/site";

/** OpenAPI catalog — Public + Agent discovery entry points. */
export async function GET() {
  const site = getSiteUrl().replace(/\/$/, "");
  return Response.json(
    {
      name: "Hansala APIs",
      version: "1",
      docs: `${site}/developers`,
      contact: "developers@hansala.com",
      specs: [
        {
          name: "Public API",
          openapi: `${site}/api/v1/openapi/public`,
          base: `${site}/api/v1`,
          auth: "none",
        },
        {
          name: "Agent API",
          openapi: `${site}/api/v1/openapi/agent`,
          base: `${site}/api/v1/agent`,
          auth: "Bearer hs_",
        },
      ],
    },
    { headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
