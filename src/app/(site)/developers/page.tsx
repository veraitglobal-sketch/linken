import type { Metadata } from "next";
import { requestTabs, responseTab } from "@/components/developers/build-tabs";
import {
  CASE_STUDY_FIELDS,
  COMPANY_FIELDS,
  ERROR_FIELDS,
  REFERENCE_FIELDS,
} from "@/components/developers/docs-content";
import { CodePanel } from "@/components/developers/code-panel";
import { DocsHero } from "@/components/developers/docs-hero";
import { DocsSectionHeading } from "@/components/developers/docs-section-heading";
import { DocsShell } from "@/components/developers/docs-shell";
import { DocsSignal } from "@/components/developers/docs-signal";
import { EmbedsSection } from "@/components/developers/embeds-section";
import { EndpointSection } from "@/components/developers/endpoint-section";
import {
  caseStudiesExample,
  companyExample,
  embedSnippet,
  errorExample,
  referencesExample,
} from "@/components/developers/examples";
import { FieldTable } from "@/components/developers/field-table";
import { tokenizeJson, tokenizeShell } from "@/components/developers/highlight";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Developers",
  description:
    "Linken Public API v1 and embed widgets — confirmed evidence only.",
};

const EXAMPLE_SLUG = "acme-architecture";

export default function DevelopersPage() {
  const siteUrl = getSiteUrl();
  const basePath = "/api/v1";
  const companyUrl = `${siteUrl}${basePath}/companies/${EXAMPLE_SLUG}`;
  const referencesUrl = `${companyUrl}/references`;
  const caseStudiesUrl = `${companyUrl}/case-studies`;

  const companyJson = companyExample(siteUrl);
  const referencesJson = referencesExample();
  const caseStudiesJson = caseStudiesExample(siteUrl);
  const errorJson = errorExample();

  const embeds = [
    {
      id: "badge",
      title: "Badge",
      requirement:
        "Compact verified mark. Default for existing embeds — no query param required.",
      height: 72,
      previewSrc: `${siteUrl}/embed/${EXAMPLE_SLUG}`,
      snippet: embedSnippet(siteUrl, EXAMPLE_SLUG, "badge", 72),
      tokens: tokenizeShell(embedSnippet(siteUrl, EXAMPLE_SLUG, "badge", 72)),
    },
    {
      id: "assessment",
      title: "Assessment",
      requirement:
        "Would-work-again rate and top strengths. Needs ≥3 client assessment answers on the profile.",
      height: 120,
      previewSrc: `${siteUrl}/embed/${EXAMPLE_SLUG}?variant=assessment`,
      snippet: embedSnippet(siteUrl, EXAMPLE_SLUG, "assessment", 120),
      tokens: tokenizeShell(
        embedSnippet(siteUrl, EXAMPLE_SLUG, "assessment", 120),
      ),
    },
    {
      id: "references",
      title: "References",
      requirement:
        "Up to five confirmed client references. Empty profiles show a quiet fallback.",
      height: 160,
      previewSrc: `${siteUrl}/embed/${EXAMPLE_SLUG}?variant=references`,
      snippet: embedSnippet(siteUrl, EXAMPLE_SLUG, "references", 160),
      tokens: tokenizeShell(
        embedSnippet(siteUrl, EXAMPLE_SLUG, "references", 160),
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-3 sm:px-5">
      <DocsHero
        siteUrl={siteUrl}
        basePath={basePath}
        previewTokens={tokenizeJson(companyJson)}
      />
      <DocsSignal />

      <DocsShell>
        <div className="space-y-16 lg:space-y-20">
          <section id="overview" className="scroll-mt-28">
            <DocsSectionHeading
              index="01"
              title="Overview"
              description="The Public API exposes the same confirmed facts you see on a Linken company page — partners, references, case studies, and assessment aggregates."
            />
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                {
                  title: "Confirmed only",
                  body: "Never pending invites, private emails, or confirmation tokens.",
                },
                {
                  title: "Edge-cache friendly",
                  body: "public, s-maxage=300, stale-while-revalidate=3600. Errors are no-store.",
                },
                {
                  title: "Open CORS",
                  body: "GET and OPTIONS from any origin — drop into any frontend.",
                },
                {
                  title: "No API key",
                  body: "Public GETs are open. Trust comes from confirmation rules, not secrets.",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="rounded-[24px] border border-line bg-surface px-5 py-5"
                >
                  <p className="font-display text-lg font-medium tracking-[-0.03em] text-ink">
                    {card.title}
                  </p>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                    {card.body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section id="quickstart" className="scroll-mt-28">
            <DocsSectionHeading
              index="02"
              title="Quickstart"
              description={`One request. Replace ${EXAMPLE_SLUG} with any public profile slug.`}
            />
            <div className="mt-7 overflow-hidden rounded-[28px] border border-line bg-[#10231f]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-7">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.14em] text-white/40 uppercase">
                    First call
                  </p>
                  <p className="mt-1 font-display text-xl tracking-[-0.03em] text-white">
                    Fetch a company in under a minute
                  </p>
                </div>
                <Badge
                  tone="success"
                  className="border-[#5ec4a8]/35 bg-[#5ec4a8]/15 text-[#5ec4a8]"
                >
                  GET
                </Badge>
              </div>
              <div className="px-4 py-5 sm:px-6">
                <CodePanel tabs={requestTabs(companyUrl)} />
              </div>
            </div>
          </section>

          <div id="endpoints" className="scroll-mt-28 space-y-8">
            <DocsSectionHeading
              index="03"
              title="Endpoints"
              description={`Base path ${siteUrl}${basePath}. All responses are JSON. Fields match the public contract in types.ts.`}
            />

            <EndpointSection
              id="endpoint-company"
              index="03.1"
              path={`/api/v1/companies/{slug}`}
              title="Company"
              description="Profile, trust level, confirmed stats, and assessment aggregates when anonymity rules allow."
              notes={
                <p>
                  Unclaimed companies return{" "}
                  <code className="text-[12px]">claimed: false</code> with{" "}
                  <code className="text-[12px]">stats</code> and{" "}
                  <code className="text-[12px]">assessment</code> set to{" "}
                  <code className="text-[12px]">null</code>.
                </p>
              }
              fields={COMPANY_FIELDS}
              requestTabs={requestTabs(companyUrl)}
              responseTabs={responseTab(companyJson)}
            />

            <EndpointSection
              id="endpoint-references"
              index="03.2"
              path={`/api/v1/companies/{slug}/references`}
              title="References"
              description="Confirmed service references only (max 50). Ongoing engagements are listed first."
              fields={REFERENCE_FIELDS}
              requestTabs={requestTabs(referencesUrl)}
              responseTabs={responseTab(referencesJson)}
            />

            <EndpointSection
              id="endpoint-case-studies"
              index="03.3"
              path={`/api/v1/companies/{slug}/case-studies`}
              title="Case studies"
              description="Case studies with client or partner confirmation (max 20)."
              fields={CASE_STUDY_FIELDS}
              requestTabs={requestTabs(caseStudiesUrl)}
              responseTabs={responseTab(caseStudiesJson)}
            />
          </div>

          <section id="embeds" className="scroll-mt-28">
            <DocsSectionHeading
              index="04"
              title="Embeds"
              description="Drop an iframe on your site. Variants via ?variant=badge|assessment|references. Links back with ?src=embed."
            />
            <EmbedsSection variants={embeds} />
          </section>

          <section id="errors" className="scroll-mt-28">
            <DocsSectionHeading
              index="05"
              title="Errors"
              description="Failures use a consistent envelope. HTTP status matches the machine-readable code."
            />

            <div className="mt-7 overflow-hidden rounded-[28px] border border-line bg-surface">
              <div className="border-b border-line px-5 py-5 sm:px-7">
                <p className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
                  Status codes
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusPill status="200" label="OK" tone="success" />
                  <StatusPill
                    status="400"
                    label="invalid_request"
                    tone="neutral"
                  />
                  <StatusPill status="404" label="not_found" tone="neutral" />
                  <StatusPill status="500" label="internal" tone="ember" />
                </div>
              </div>
              <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
                <div className="border-b border-line px-5 py-6 sm:px-7 lg:border-r lg:border-b-0">
                  <p className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
                    Error body
                  </p>
                  <FieldTable fields={ERROR_FIELDS} />
                </div>
                <div className="bg-paper/50 px-4 py-5 sm:px-5 lg:py-6">
                  <CodePanel
                    tabs={[
                      {
                        id: "error",
                        label: "JSON",
                        source: errorJson,
                        tokens: tokenizeJson(errorJson),
                      },
                    ]}
                    caption="Example"
                  />
                </div>
              </div>
            </div>
          </section>

          <section id="versioning" className="scroll-mt-28">
            <DocsSectionHeading
              index="06"
              title="Versioning"
              description="A stable contract you can ship against."
            />
            <div className="mt-7 grid overflow-hidden rounded-[28px] border border-line bg-surface sm:grid-cols-[0.9fr_1.1fr]">
              <div className="bg-[#10231f] px-6 py-8 text-white sm:px-8">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-[#5ec4a8] uppercase">
                  Current
                </p>
                <p className="mt-3 font-display text-[clamp(1.8rem,3vw,2.4rem)] font-medium tracking-[-0.04em]">
                  /api/v1/
                </p>
                <p className="mt-3 text-[14px] leading-relaxed text-white/65">
                  Fields may be added. Never renamed, removed, or redefined.
                </p>
              </div>
              <div className="px-6 py-8 sm:px-8">
                <p className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
                  Breaking changes
                </p>
                <p className="mt-3 font-display text-[clamp(1.4rem,2.2vw,1.75rem)] font-medium tracking-[-0.03em] text-ink">
                  Ship under /api/v2/
                </p>
                <p className="mt-3 max-w-[28rem] text-[14px] leading-relaxed text-ink-soft">
                  Clients on v1 keep working. New major versions only when the
                  meaning of a field must change.
                </p>
              </div>
            </div>
          </section>
        </div>
      </DocsShell>
    </div>
  );
}

function StatusPill({
  status,
  label,
  tone,
}: {
  status: string;
  label: string;
  tone: "success" | "neutral" | "ember";
}) {
  if (tone === "ember") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-sm border border-ember/35 bg-ember/10 px-1.5 py-0.5 text-[11px] font-medium tracking-[0.04em] text-ink",
        )}
      >
        <span className="font-mono">{status}</span>
        <span className="text-ink-soft">{label}</span>
      </span>
    );
  }
  return (
    <Badge tone={tone} className="gap-1.5">
      <span className="font-mono">{status}</span>
      <span>{label}</span>
    </Badge>
  );
}
