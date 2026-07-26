import { CodePanel } from "@/components/developers/code-panel";
import { DocsSectionHeading } from "@/components/developers/docs-section-heading";
import { tokenizeShell } from "@/components/developers/highlight";
import { getDocsSiteUrl } from "@/lib/site";

const ITEMS = [
  {
    name: "partner-wall",
    title: "Partner wall",
    prop: "PartnerWall",
    file: "partner-wall",
    blurb: "Confirmed partners — initials strip, links to your profile.",
  },
  {
    name: "verified-clients",
    title: "Verified clients",
    prop: "VerifiedClients",
    file: "verified-clients",
    blurb: "Confirmed client references from the public API.",
  },
  {
    name: "hansala-badge",
    title: "Hansala badge",
    prop: "HansalaBadge",
    file: "hansala-badge",
    blurb: "Compact footer lockup with trust level.",
  },
] as const;

/** Installable React components (not the iframe badge). */
export function RegistrySection() {
  const site = getDocsSiteUrl();

  return (
    <section id="registry" className="scroll-mt-28">
      <DocsSectionHeading
        index="05b"
        title="Installable components"
        description="Styleable Server Components for your own site. The iframe badge stays the tamper-proof trust signal; these are content surfaces. Slug prop only — no API key, no account."
      />

      <div className="mt-6 space-y-6">
        {ITEMS.map((item) => {
          const url = `${site}/r/${item.name}.json`;
          const cmd = `npx shadcn@latest add ${url}`;
          const usage = `import { ${item.prop} } from "@/components/hansala/${item.file}"\n\n<${item.prop} slug="your-company-slug" />`;
          return (
            <div
              key={item.name}
              className="rounded-[22px] border border-line/70 bg-surface px-5 py-5"
            >
              <h3 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
                {item.title}
              </h3>
              <p className="mt-1 text-[13px] text-ink-soft">{item.blurb}</p>
              <div className="mt-4 space-y-3">
                <CodePanel
                  caption="Install"
                  tabs={[
                    {
                      id: "install",
                      label: "shadcn",
                      source: cmd,
                      tokens: tokenizeShell(cmd),
                    },
                  ]}
                />
                <CodePanel
                  caption="Usage"
                  tabs={[
                    {
                      id: "usage",
                      label: "tsx",
                      source: usage,
                      tokens: tokenizeShell(usage),
                    },
                  ]}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-6 max-w-[42rem] text-[13px] leading-relaxed text-ink-soft">
        Client-side fetch works too — the Public API sends{" "}
        <code className="text-ink">Access-Control-Allow-Origin: *</code>. Prefer
        the Server Component so there is no CORS dependency. Links use{" "}
        <code className="text-ink">?src=embed&amp;via=&#123;host&#125;</code> so
        profile visits attribute to the widget host (reuses the embed analytics
        source — no tracking script on your site).
      </p>
    </section>
  );
}
