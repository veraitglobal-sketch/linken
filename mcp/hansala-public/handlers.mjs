/** Public API handlers — no keys, ever. */

const REGISTRY = new Set([
  "partner-wall",
  "verified-clients",
  "hansala-badge",
]);

const IFRAME_HEIGHT = {
  micro: 52,
  horizontal: 56,
  starter: 64,
  score: 72,
  "trust-card": 120,
  credentials: 100,
  signature: 80,
  references: 160,
  assessment: 120,
  verified: 48,
};

function iframeSnippet(base, slug, variant) {
  const v = variant && variant !== "horizontal" ? `?variant=${variant}` : "";
  const h = IFRAME_HEIGHT[variant] ?? 56;
  const src = `${base}/embed/${encodeURIComponent(slug)}${v}`;
  return `<iframe src="${src}" width="320" height="${h}" style="border:0" title="Verified on Hansala" loading="lazy"></iframe>`;
}

export async function handleTool(name, args, { publicGet, base }) {
  switch (name) {
    case "verify_company": {
      const domain = String(args.domain ?? "").trim();
      if (!domain) throw new Error("domain is required.");
      return publicGet(`/api/v1/verify?domain=${encodeURIComponent(domain)}`);
    }
    case "get_company_proof": {
      const slug = String(args.slug ?? "").trim();
      if (!slug) throw new Error("slug is required.");
      const enc = encodeURIComponent(slug);
      const [company, partners, references] = await Promise.all([
        publicGet(`/api/v1/companies/${enc}`),
        publicGet(`/api/v1/companies/${enc}/partners`),
        publicGet(`/api/v1/companies/${enc}/references`),
      ]);
      return {
        slug: company.slug,
        name: company.name,
        profile_url: company.profile_url,
        trust_level: company.trust_level,
        verified: company.verified,
        claimed: company.claimed,
        stats: company.stats,
        partners: partners.partners ?? [],
        references: references.references ?? [],
      };
    }
    case "get_widget_snippet": {
      const slug = String(args.slug ?? "").trim();
      if (!slug) throw new Error("slug is required.");
      const variant = String(args.variant ?? "partner-wall").trim().toLowerCase();
      const registryName = REGISTRY.has(variant) ? variant : "partner-wall";
      const iframeVariant = REGISTRY.has(variant) ? "horizontal" : variant;
      const registryUrl = `${base}/r/${registryName}.json`;
      return {
        slug,
        variant: registryName,
        shadcn_install: `npx shadcn@latest add ${registryUrl}`,
        react_usage: `import { ${exportName(registryName)} } from "@/components/hansala/${registryName}"\n\n<${exportName(registryName)} slug="${slug}" />`,
        iframe_snippet: iframeSnippet(base, slug, iframeVariant),
        iframe_note:
          "Iframe badge is domain-locked and tamper-resistant. React registry components are styleable content surfaces — they link back to the Hansala profile for attribution.",
        docs: `${base}/developers#registry`,
      };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function exportName(registryName) {
  if (registryName === "partner-wall") return "PartnerWall";
  if (registryName === "verified-clients") return "VerifiedClients";
  return "HansalaBadge";
}
