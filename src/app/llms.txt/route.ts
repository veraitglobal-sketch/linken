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
- [Developers](${siteUrl}/developers): Public API contract, Agent API, embeds, and error shapes.

## API
- [Company](${siteUrl}/api/v1/companies/{slug}): Profile, trust level, confirmed stats, assessment aggregates (≥3 rule).
- [References](${siteUrl}/api/v1/companies/{slug}/references): Confirmed client relationships only.
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
