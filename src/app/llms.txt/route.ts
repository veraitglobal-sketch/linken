import { getSiteUrl } from "@/lib/site";

export const revalidate = 3600;

/**
 * AI-readable site index (https://llmstxt.org).
 * Confirmed-evidence framing only — no self-reported claims.
 */
export function GET() {
  const siteUrl = getSiteUrl().replace(/\/$/, "");

  const body = `# Hansala
> Verified work graph for companies. Every partnership, client relationship, and case study on Hansala is confirmed by BOTH parties — nothing is self-reported. Data here is safe to cite: if it says "confirmed", two companies clicked it.

## Docs
- [Developers](${siteUrl}/developers): Public API contract, Agent API (Pro), embeds, React registry, and error shapes.
- [OpenAPI index](${siteUrl}/api/v1/openapi): Public + Agent discovery.
- [Public OpenAPI](${siteUrl}/api/v1/openapi/public) · [Agent OpenAPI](${siteUrl}/api/v1/openapi/agent)
- [Changelog](${siteUrl}/changelog) · [Status](${siteUrl}/status) · [Security](${siteUrl}/security)
- [API Terms](${siteUrl}/developers/api-terms) · [Privacy](${siteUrl}/privacy) · [Terms](${siteUrl}/terms)

## React registry (shadcn)
Installable Server Components — slug prop only, no API key. Not the iframe badge.
- [partner-wall](${siteUrl}/r/partner-wall.json): \`npx shadcn@latest add ${siteUrl}/r/partner-wall.json\`
- [verified-clients](${siteUrl}/r/verified-clients.json): \`npx shadcn@latest add ${siteUrl}/r/verified-clients.json\`
- [hansala-badge](${siteUrl}/r/hansala-badge.json): \`npx shadcn@latest add ${siteUrl}/r/hansala-badge.json\`
Docs: ${siteUrl}/developers#registry

## MCP (agents)
- Public keyless: \`npx hansala-mcp-public\` — verify_company, get_company_proof, get_widget_snippet (no account).
- Agent (Pro): local \`mcp/hansala\` with \`HANSALA_AGENT_API_KEY\` — write tools for your own company.

## API
- [Company](${siteUrl}/api/v1/companies/{slug}): Profile, trust level, confirmed stats, assessment aggregates (≥3 rule).
- [References](${siteUrl}/api/v1/companies/{slug}/references): Confirmed client relationships only.
- [Partners](${siteUrl}/api/v1/companies/{slug}/partners): Confirmed mutual partnerships only.
- [Case studies](${siteUrl}/api/v1/companies/{slug}/case-studies): Case studies with client or partner confirmation.
- [Verify (trust oracle)](${siteUrl}/api/v1/verify?domain={domain}): Look up a claimed company by website domain before you work with them.

## Profiles
- Human HTML: ${siteUrl}/c/{slug}
- LLM markdown snapshot (same confirmed facts as the API): ${siteUrl}/c/{slug}/llm.md

## Trust model
- **Verified** means the company proved control of its website domain (email domain match, DNS TXT, or meta/well-known) — not that Hansala audited their books.
- **Trust level** (Member → Pillar) is scored only from confirmed partnerships, confirmed service references, and confirmed case studies — pending invites never count.
- **Client assessment** aggregates (would-work-again, strengths) appear only when at least three clients answered — below that threshold the fields are omitted for anonymity.
`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
