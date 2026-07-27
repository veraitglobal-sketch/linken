import type { Metadata } from "next";
import {
  agentRequestTabs,
  requestTabs,
  responseTab,
} from "@/components/developers/build-tabs";
import {
  CASE_STUDY_FIELDS,
  COMPANY_FIELDS,
  ERROR_FIELDS,
  REFERENCE_FIELDS,
  TESTIMONIAL_FIELDS,
  VERIFY_FIELDS,
} from "@/components/developers/docs-content";
import { CodePanel } from "@/components/developers/code-panel";
import { DocsDashboardApiLink } from "@/components/developers/docs-dashboard-api-link";
import { DocsHero } from "@/components/developers/docs-hero";
import { DocsSectionHeading } from "@/components/developers/docs-section-heading";
import { DocsShell } from "@/components/developers/docs-shell";
import { DocsSignal } from "@/components/developers/docs-signal";
import { EmbedsSection } from "@/components/developers/embeds-section";
import { RegistrySection } from "@/components/developers/registry-section";
import { EndpointSection } from "@/components/developers/endpoint-section";
import {
  caseStudiesExample,
  testimonialsExample,
  companyExample,
  embedSnippet,
  errorExample,
  referencesExample,
  verifyExample,
} from "@/components/developers/examples";
import { FieldTable } from "@/components/developers/field-table";
import { tokenizeJson, tokenizeShell } from "@/components/developers/highlight";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { getDocsSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Developers",
  description:
    "Hansala Public API v1 and embed widgets — confirmed evidence only.",
};

const EXAMPLE_SLUG = "example-architecture";

export default function DevelopersPage() {
  /** Public API + embed examples — always hansala.com (never *.vercel.app). */
  const docsUrl = getDocsSiteUrl();
  const basePath = "/api/v1";
  const companyUrl = `${docsUrl}${basePath}/companies/${EXAMPLE_SLUG}`;
  const referencesUrl = `${companyUrl}/references`;
  const caseStudiesUrl = `${companyUrl}/case-studies`;
  const testimonialsUrl = `${companyUrl}/testimonials`;
  const verifyUrl = `${docsUrl}${basePath}/verify?domain=example.com`;

  const companyJson = companyExample(docsUrl);
  const referencesJson = referencesExample();
  const caseStudiesJson = caseStudiesExample(docsUrl);
  const testimonialsJson = testimonialsExample(docsUrl);
  const verifyJson = verifyExample(docsUrl);
  const errorJson = errorExample();

  const embeds = [
    {
      id: "micro",
      title: "Micro",
      requirement:
        "Free status bar with proof strip — no partner logos. Default: ?variant=micro",
      height: 52,
      previewSrc: `${docsUrl}/embed/${EXAMPLE_SLUG}?variant=micro&preview=1`,
      snippet: embedSnippet(docsUrl, EXAMPLE_SLUG, "micro", 52),
      tokens: tokenizeShell(embedSnippet(docsUrl, EXAMPLE_SLUG, "micro", 52)),
    },
    {
      id: "horizontal",
      title: "Horizontal",
      requirement:
        "Full-width trust bar with level, proof strip, and confirmed count.",
      height: 56,
      previewSrc: `${docsUrl}/embed/${EXAMPLE_SLUG}?preview=1`,
      snippet: embedSnippet(docsUrl, EXAMPLE_SLUG, "horizontal", 56),
      tokens: tokenizeShell(embedSnippet(docsUrl, EXAMPLE_SLUG, "horizontal", 56)),
    },
    {
      id: "assessment",
      title: "Assessment",
      requirement:
        "Pro. Would-work-again rate and top strengths. Needs ≥3 client assessment answers.",
      height: 120,
      previewSrc: `${docsUrl}/embed/${EXAMPLE_SLUG}?variant=assessment&preview=1`,
      snippet: embedSnippet(docsUrl, EXAMPLE_SLUG, "assessment", 120),
      tokens: tokenizeShell(
        embedSnippet(docsUrl, EXAMPLE_SLUG, "assessment", 120),
      ),
    },
    {
      id: "references",
      title: "References",
      requirement:
        "Pro. Up to five confirmed client references. Free plans fall back to Horizontal.",
      height: 160,
      previewSrc: `${docsUrl}/embed/${EXAMPLE_SLUG}?variant=references&preview=1`,
      snippet: embedSnippet(docsUrl, EXAMPLE_SLUG, "references", 160),
      tokens: tokenizeShell(
        embedSnippet(docsUrl, EXAMPLE_SLUG, "references", 160),
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-3 sm:px-5">
      <DocsHero
        siteUrl={docsUrl}
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
              description="The Public API exposes the same confirmed facts you see on a Hansala company page — partners, references, case studies, client testimonials, and assessment aggregates."
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
            <div className="mt-7 overflow-hidden rounded-[28px] border border-line bg-[#0e1f1c]">
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
                  className="border-[#7eb8a4]/35 bg-[#7eb8a4]/15 text-[#7eb8a4]"
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
              description={`Base path ${docsUrl}${basePath}. All responses are JSON. Fields match the public contract in types.ts.`}
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
              id="endpoint-partners"
              index="03.3"
              path={`/api/v1/companies/{slug}/partners`}
              title="Partners"
              description="Accepted mutual partnerships only — name, slug, verified. No emails or tokens."
              fields={[
                {
                  name: "partners",
                  type: "ApiPartner[]",
                  description: "Confirmed partners.",
                },
                { name: "count", type: "number", description: "Length of partners." },
                {
                  name: "partners[].name",
                  type: "string",
                  description: "Partner company name.",
                },
                {
                  name: "partners[].slug",
                  type: "string",
                  description: "Public profile slug.",
                },
                {
                  name: "partners[].verified",
                  type: "boolean",
                  description: "Domain-verified partner.",
                },
              ]}
              requestTabs={requestTabs(`${companyUrl}/partners`)}
              responseTabs={responseTab(
                `{\n  "partners": [{ "name": "Nordwerk Holding", "slug": "nordwerk-holding", "verified": true }],\n  "count": 1\n}`,
              )}
            />

            <EndpointSection
              id="endpoint-case-studies"
              index="03.4"
              path={`/api/v1/companies/{slug}/case-studies`}
              title="Case studies"
              description="Case studies with client or partner confirmation (max 20)."
              fields={CASE_STUDY_FIELDS}
              requestTabs={requestTabs(caseStudiesUrl)}
              responseTabs={responseTab(caseStudiesJson)}
            />

            <EndpointSection
              id="endpoint-testimonials"
              index="03.5"
              path={`/api/v1/companies/{slug}/testimonials`}
              title="Testimonials"
              description="Published client-written testimonials only (max 50). Full text with named attribution — never truncated."
              notes={
                <p>
                  Written and published by the client, not the profile owner. Only{" "}
                  <code className="text-[12px]">status: published</code> with{" "}
                  <code className="text-[12px]">consent_public: true</code> appear.
                  Testimonials tied to undisclosed references or case confirmations are
                  omitted. Author email is never returned.
                </p>
              }
              fields={TESTIMONIAL_FIELDS}
              requestTabs={requestTabs(testimonialsUrl)}
              responseTabs={responseTab(testimonialsJson)}
            />

            <EndpointSection
              id="endpoint-verify"
              index="03.6"
              path={`/api/v1/verify?domain={domain}`}
              title="Verify (trust oracle)"
              description="One call to check a firm by website domain before you work with them. No API key. Unknown domains return found:false with HTTP 200."
              notes={
                <p>
                  Domain matching uses the same normalization as verification
                  (exact host, www stripped). Only claimed companies are
                  returned. Confirmed evidence only — never tokens or private
                  fields.
                </p>
              }
              fields={VERIFY_FIELDS}
              requestTabs={requestTabs(verifyUrl)}
              responseTabs={responseTab(verifyJson)}
            />
          </div>

          <section id="llms" className="scroll-mt-28">
            <DocsSectionHeading
              index="04"
              title="llms.txt & llm.md"
              description="Machine-readable entry points for AI agents that cite Hansala."
            />
            <ul className="mt-5 space-y-2 text-[14px] leading-relaxed text-ink-soft">
              <li>
                <a
                  href="/llms.txt"
                  className="font-semibold text-ink underline underline-offset-2"
                >
                  /llms.txt
                </a>{" "}
                — site index: docs, API, profiles, trust model.
              </li>
              <li>
                <code className="text-[12px]">/c/{"{slug}"}/llm.md</code> —
                markdown snapshot of a profile (same confirmed facts as the
                Public API). Linked from the HTML profile via{" "}
                <code className="text-[12px]">rel=&quot;alternate&quot;</code>.
              </li>
            </ul>
          </section>

          <section id="embeds" className="scroll-mt-28">
            <DocsSectionHeading
              index="05"
              title="Embeds"
              description="Drop an iframe on your site. Free: verified, micro, horizontal. Pro unlocks starter, score, trust-card, credentials, signature, references, assessment. Public Pro URLs fall back to Horizontal without a paid plan. Links back with ?src=embed."
            />
            <p className="mt-4 text-[14px] text-ink-soft">
              Prefer a visual configurator?{" "}
              <a
                href="/dashboard/widgets"
                className="font-semibold text-ink underline underline-offset-2"
              >
                Configure in your dashboard →
              </a>
            </p>
            <p className="mt-3 text-[13px] leading-relaxed text-muted">
              <strong className="font-semibold text-ink-soft">Testimonials embed:</strong>{" "}
              the dashboard snippet includes <code className="text-[12px]">embed-resize.js</code>{" "}
              — it only listens for <code className="text-[12px]">postMessage</code> height
              updates from the iframe (no analytics, no network). Fixed-height iframes still work
              without the script.
            </p>
            <EmbedsSection variants={embeds} />
          </section>

          <RegistrySection />

          <section id="agent-api" className="scroll-mt-28">
            <DocsSectionHeading
              index="06"
              title="Agent API"
              description="Pro plan. Authenticated write surface for AI agents acting as your company. Create keys in Workspace → API after upgrading."
            />

            <div
              id="agent-cannot"
              className="mt-7 rounded-[28px] border border-[#0e1f1c]/15 bg-[#0e1f1c] px-5 py-6 text-white sm:px-7"
            >
              <p className="text-[11px] font-semibold tracking-[0.14em] text-[#7eb8a4] uppercase">
                What agents cannot do
              </p>
              <p className="mt-3 font-display text-[clamp(1.35rem,2.4vw,1.75rem)] font-medium tracking-[-0.03em]">
                Human confirmation is the product.
              </p>
              <ul className="mt-4 space-y-2 text-[14px] leading-relaxed text-white/75">
                <li>
                  No confirm / accept / claim / respond endpoints — ever. An
                  agent may build and invite; only a person with an email link
                  may confirm.
                </li>
                <li>
                  No ownership transfer — blast radius stays human-only in the
                  dashboard.
                </li>
                <li>
                  Keys are scoped to one company. Foreign company ids in the
                  body are ignored or rejected. Public third-party reads use
                  the Public API, not Agent routes.
                </li>
                <li>
                  Tokens for other parties, private_feedback, and foreign
                  inquiries are never returned. Your own verify_token is
                  available under verification:run.
                </li>
                <li>
                  Fields like verified, plan, and claimed are not writable via
                  PATCH /company. Profile fields including name, category, and
                  slug are allowed under content:write.
                </li>
              </ul>
            </div>

            <div id="agent-auth" className="mt-10 scroll-mt-28">
              <h3 className="font-display text-xl font-medium tracking-[-0.03em] text-ink">
                Auth & scopes
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                Send{" "}
                <code className="text-[12px]">Authorization: Bearer hs_…</code>.
                The raw key is shown once at creation; we store only a SHA-256
                hash. Revoke instantly from the dashboard.
              </p>
              <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
                <table className="w-full min-w-[28rem] text-left text-[13px]">
                  <thead className="border-b border-line bg-[#fafbfc] text-[11px] tracking-[0.08em] text-[#94a3b8] uppercase">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">Scope</th>
                      <th className="px-4 py-2.5 font-semibold">Allows</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-ink-soft">
                    {[
                      ["read", "Company, refs, cases, partnerships, inquiries, analytics, audit"],
                      ["content:write", "Content, logo, profile fields, case-study partner tags"],
                      ["invites:send", "Send confirmation / claim invites (never confirm)"],
                      ["team:manage", "Team list, invites, remove members (accept via /join)"],
                      ["structure:manage", "Groups, subsidiaries, parent proposals, leave"],
                      ["settings:write", "Widget settings, embed catalog, accepting clients"],
                      ["inquiries:manage", "Patch inquiry status"],
                      ["verification:run", "Verify token/instructions + run checks"],
                      ["webhooks:manage", "Outbound webhook endpoints + test"],
                    ].map(([scope, allows]) => (
                      <tr key={scope}>
                        <td className="px-4 py-2.5 font-mono text-[12px] text-ink">
                          {scope}
                        </td>
                        <td className="px-4 py-2.5">{allows}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-[13px] text-ink-soft">
                Presets in Workspace → API: Read only, Content manager, Full
                access. Rate limits: 120/min per key; invites 20/day per key.
              </p>
            </div>

            <div id="agent-parity" className="mt-10 scroll-mt-28">
              <h3 className="font-display text-xl font-medium tracking-[-0.03em] text-ink">
                Owner action → API endpoint
              </h3>
              <p className="mt-2 text-[14px] text-ink-soft">
                Everything an owner can click — except confirmations and
                ownership transfer — maps to Agent API.
              </p>
              <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
                <table className="w-full min-w-[36rem] text-left text-[12px]">
                  <thead className="border-b border-line bg-[#fafbfc] text-[11px] tracking-[0.08em] text-[#94a3b8] uppercase">
                    <tr>
                      <th className="px-3 py-2.5 font-semibold">Owner action</th>
                      <th className="px-3 py-2.5 font-semibold">Endpoint</th>
                      <th className="px-3 py-2.5 font-semibold">Scope</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-ink-soft">
                    {[
                      ["Edit profile fields", "PATCH /company", "content:write"],
                      ["Refresh / upload logo", "POST /logo/refresh · PUT /logo", "content:write"],
                      ["Add / edit / delete reference", "POST|PATCH|DELETE /references", "content:write"],
                      ["Send reference invite", "POST /references/{id}/invite", "invites:send"],
                      ["Case studies + partner tags", "…/case-studies · …/partners", "content:write"],
                      ["Case study cover + gallery", "PUT|DELETE …/case-studies/{id}/cover · …/gallery", "content:write"],
                      ["Client confirmation request", "POST /client-confirmations", "invites:send"],
                      ["Invite partner (ghost)", "POST /partner-invites", "invites:send"],
                      ["Verify domain / backlink", "GET|POST /verification…", "verification:run"],
                      ["Team invite / remove", "…/team…", "team:manage"],
                      ["Team profile + photo + permissions", "PATCH …/team/members/{id} · PUT …/photo", "team:manage"],
                      ["Group / subsidiary / hierarchy", "…/group…", "structure:manage"],
                      ["Widgets & logo wall", "GET /widgets · GET|PUT /widgets/partners · GET|PATCH /widget-settings", "settings:write"],
                      ["Calendly / Cal.com booking", "GET|PUT|DELETE /scheduling", "read · settings:write"],
                      ["Outbound webhooks", "GET|POST|PATCH|DELETE /webhooks…", "webhooks:manage"],
                      ["Triage inquiries", "GET /inquiries · PATCH /inquiries/{id}", "read · inquiries:manage"],
                      ["Analytics / audit", "GET /analytics · GET /audit-log", "read"],
                    ].map(([action, endpoint, scope]) => (
                      <tr key={action}>
                        <td className="px-3 py-2 text-ink">{action}</td>
                        <td className="px-3 py-2 font-mono text-[11px]">{endpoint}</td>
                        <td className="px-3 py-2 font-mono text-[11px]">{scope}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div id="agent-setup" className="mt-10 scroll-mt-28 space-y-4">
              <h3 className="font-display text-xl font-medium tracking-[-0.03em] text-ink">
                Agent setup script
              </h3>
              <p className="text-[14px] text-ink-soft">
                Full lifecycle in six calls — create content, invite humans to
                confirm, configure the badge.
              </p>
              <CodePanel
                tabs={agentRequestTabs(
                  "PATCH",
                  `${docsUrl}/api/v1/agent/company`,
                  {
                    tagline: "Verified B2B network",
                    city: "Berlin",
                  },
                )}
              />
              <ul className="space-y-1.5 rounded-2xl border border-line bg-[#fafbfc] px-5 py-4 text-[13px] text-ink-soft">
                <li>1. <code className="text-ink">PATCH /company</code> — tagline & city</li>
                <li>2. <code className="text-ink">POST /logo/refresh</code> — pull logo from domain</li>
                <li>3. <code className="text-ink">POST /case-studies</code> — dossier text</li>
                <li>4. <code className="text-ink">PUT …/case-studies/{"{id}"}/cover</code> — hero photo (base64 or multipart)</li>
                <li>5. <code className="text-ink">POST /team/invitations</code> — invite teammates</li>
                <li>6. <code className="text-ink">GET /widgets</code> + <code className="text-ink">GET /widgets/partners</code> — pick embed + curate Logo wall</li>
                <li>7. <code className="text-ink">PUT /widgets/partners/&#123;id&#125;/logo</code> — upload replacement marks from a local folder via MCP</li>
              </ul>
              <p className="text-[13px] text-muted">
                Create your key in{" "}
                <DocsDashboardApiLink className="font-semibold text-ink">
                  Workspace → API
                </DocsDashboardApiLink>{" "}
                — choose preset <strong className="font-semibold text-ink-soft">AI agent</strong>.
              </p>
            </div>

            <div id="agent-mcp" className="mt-10 scroll-mt-28 space-y-4">
              <h3 className="font-display text-xl font-medium tracking-[-0.03em] text-ink">
                Cursor & Claude (MCP)
              </h3>
              <div className="rounded-2xl border border-line bg-[#fafbfc] px-5 py-4 text-[13px] text-ink-soft">
                <p className="font-semibold text-ink">Public MCP (no key)</p>
                <p className="mt-1">
                  Anyone can install{" "}
                  <code className="text-[12px]">npx hansala-mcp-public</code> —
                  verify companies, pull confirmed proof, get shadcn + iframe
                  snippets. See{" "}
                  <code className="text-[12px]">.cursor/mcp.json.example</code>{" "}
                  → <code className="text-[12px]">hansala-public</code>.
                </p>
                <p className="mt-4 font-semibold text-ink">Agent MCP (Pro)</p>
                <p className="mt-1">
                  Local bridge for{" "}
                  <strong className="text-ink">your</strong> company — same{" "}
                  <code className="text-[12px]">hs_…</code> key as{" "}
                  <code className="text-[12px]">HANSALA_AGENT_API_KEY</code>. Logo
                  wall:{" "}
                  <code className="text-[12px]">hansala_list_widget_partners</code>,{" "}
                  <code className="text-[12px]">hansala_upload_partner_logo</code>{" "}
                  (<code className="text-[12px]">image_path</code>),{" "}
                  <code className="text-[12px]">hansala_update_widget_settings</code>.
                </p>
                <p className="mt-3">
                  1. Create key in{" "}
                  <DocsDashboardApiLink className="text-ink">
                    /dashboard/api
                  </DocsDashboardApiLink>{" "}
                  → <strong className="text-ink">AI agent</strong>
                </p>
                <p className="mt-2">
                  2. Copy{" "}
                  <code className="text-[12px]">.cursor/mcp.json.example</code> →{" "}
                  <code className="text-[12px]">.cursor/mcp.json</code>,{" "}
                  <code className="text-[12px]">npm install</code> in{" "}
                  <code className="text-[12px]">mcp/hansala</code>
                </p>
                <p className="mt-2">
                  3. Tools:{" "}
                  <code className="text-[12px]">hansala_create_case_study</code>,
                  uploads, invites — scoped to the key.
                </p>
              </div>
              <p className="text-[13px] text-muted">
                Direct HTTP? Call{" "}
                <code className="text-[12px]">{docsUrl}/api/v1/agent</code> with{" "}
                <code className="text-[12px]">Authorization: Bearer hs_…</code> —
                no MCP required.
              </p>
            </div>

            <div id="agent-endpoints" className="mt-10 scroll-mt-28 space-y-6">
              <h3 className="font-display text-xl font-medium tracking-[-0.03em] text-ink">
                Endpoints
              </h3>
              <p className="text-[14px] text-ink-soft">
                Base path{" "}
                <code className="text-[12px]">
                  {docsUrl}/api/v1/agent
                </code>
                . Successes return{" "}
                <code className="text-[12px]">{"{ data: … }"}</code>. Mutations
                are audit-logged. Team members expose opaque{" "}
                <code className="text-[12px]">member_id</code> (sha256 hex
                prefix) — never <code className="text-[12px]">user_id</code>.
              </p>

              <div className="overflow-hidden rounded-[28px] border border-line bg-surface">
                <div className="border-b border-line px-5 py-4 sm:px-7">
                  <Badge tone="success">GET</Badge>
                  <code className="ml-2 text-[13px] text-ink">
                    /api/v1/agent/company
                  </code>
                </div>
                <div className="px-4 py-4 sm:px-6">
                  <CodePanel
                    tabs={agentRequestTabs(
                      "GET",
                      `${docsUrl}/api/v1/agent/company`,
                    )}
                  />
                </div>
              </div>

              <div className="overflow-hidden rounded-[28px] border border-line bg-surface">
                <div className="border-b border-line px-5 py-4 sm:px-7">
                  <Badge tone="accent">POST</Badge>
                  <code className="ml-2 text-[13px] text-ink">
                    /api/v1/agent/references
                  </code>
                </div>
                <div className="px-4 py-4 sm:px-6">
                  <CodePanel
                    tabs={agentRequestTabs(
                      "POST",
                      `${docsUrl}/api/v1/agent/references`,
                      {
                        client_name: "CleanCo",
                        service: "Office cleaning",
                        started_year: "2024",
                        ongoing: true,
                      },
                    )}
                  />
                </div>
              </div>
            </div>
          </section>

          <section id="errors" className="scroll-mt-28">
            <DocsSectionHeading
              index="07"
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
                    status="401"
                    label="unauthorized / invalid_key"
                    tone="neutral"
                  />
                  <StatusPill
                    status="403"
                    label="insufficient_scope"
                    tone="neutral"
                  />
                  <StatusPill status="404" label="not_found" tone="neutral" />
                  <StatusPill
                    status="422"
                    label="invalid_request"
                    tone="neutral"
                  />
                  <StatusPill
                    status="429"
                    label="rate_limited"
                    tone="neutral"
                  />
                  <StatusPill
                    status="503"
                    label="service_unavailable"
                    tone="ember"
                  />
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
              index="08"
              title="Versioning"
              description="A stable contract you can ship against."
            />
            <div className="mt-7 grid overflow-hidden rounded-[28px] border border-line bg-surface sm:grid-cols-[0.9fr_1.1fr]">
              <div className="bg-[#0e1f1c] px-6 py-8 text-white sm:px-8">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-[#7eb8a4] uppercase">
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
                <p className="mt-5 text-[13px] text-ink-soft">
                  <a href="/api/v1/openapi" className="font-semibold text-ink underline underline-offset-2">
                    OpenAPI index
                  </a>
                  {" · "}
                  <a href="/api/v1/openapi/public" className="font-semibold text-ink underline underline-offset-2">
                    Public
                  </a>
                  {" · "}
                  <a href="/api/v1/openapi/agent" className="font-semibold text-ink underline underline-offset-2">
                    Agent
                  </a>
                  {" · "}
                  <a href="/developers/webhooks" className="font-semibold text-ink underline underline-offset-2">
                    Webhooks
                  </a>
                  {" · "}
                  <a href="/changelog" className="font-semibold text-ink underline underline-offset-2">
                    Changelog
                  </a>
                  {" · "}
                  <a href="/status" className="font-semibold text-ink underline underline-offset-2">
                    Status
                  </a>
                  {" · "}
                  <a href="/developers/api-terms" className="font-semibold text-ink underline underline-offset-2">
                    API Terms
                  </a>
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
