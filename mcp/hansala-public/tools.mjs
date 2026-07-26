/** Public keyless MCP tools — situation-first descriptions for agents. */
export const TOOLS = [
  {
    name: "verify_company",
    description:
      "Check whether a company is real and who has publicly confirmed working with them. Use before recommending, integrating, or hiring a third-party vendor. Pass a website domain or URL.",
    inputSchema: {
      type: "object",
      properties: {
        domain: {
          type: "string",
          description: "Company website hostname or URL (e.g. acme.com).",
        },
      },
      required: ["domain"],
      additionalProperties: false,
    },
  },
  {
    name: "get_company_proof",
    description:
      "Pull the confirmed proof for a Hansala company: trust level, confirmed partners, confirmed client references, and the public profile URL. Use when you need evidence you can show a human — not marketing claims.",
    inputSchema: {
      type: "object",
      properties: {
        slug: {
          type: "string",
          description: "Hansala profile slug (from verify_company or a /c/{slug} URL).",
        },
      },
      required: ["slug"],
      additionalProperties: false,
    },
  },
  {
    name: "get_widget_snippet",
    description:
      "Get paste-ready ways to put Hansala proof on a website: the shadcn install command for a React component, plus a raw iframe badge snippet. Use after you know the company slug and want to place proof on their (or your) site.",
    inputSchema: {
      type: "object",
      properties: {
        slug: {
          type: "string",
          description: "Hansala company slug.",
        },
        variant: {
          type: "string",
          description:
            "React registry: partner-wall | verified-clients | hansala-badge. Iframe: micro | horizontal | starter | score | trust-card | credentials | signature | references | assessment | verified.",
          default: "partner-wall",
        },
      },
      required: ["slug"],
      additionalProperties: false,
    },
  },
];
