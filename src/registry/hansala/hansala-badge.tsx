import { getJson, profileHref, requestViaHost } from "./lib";

type Company = {
  name: string;
  verified: boolean;
  trust_level: string;
  claimed: boolean;
  stats: { confirmed_partners: number } | null;
};

type Props = { slug: string };

/**
 * Compact Hansala footer lockup — links to the canonical profile.
 * Renders null for unknown / unclaimed companies.
 */
export async function HansalaBadge({ slug }: Props) {
  const trimmed = slug.trim();
  if (!trimmed) return null;

  const company = await getJson<Company>(
    `/api/v1/companies/${encodeURIComponent(trimmed)}`,
    { next: { revalidate: 300 } },
  );
  if (!company || company.claimed === false) return null;

  const via = await requestViaHost();
  const href = profileHref(trimmed, via);
  const partners = company.stats?.confirmed_partners ?? 0;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 no-underline"
    >
      <span className="text-[11px] font-semibold tracking-[-0.02em] text-neutral-900">
        {company.name}
      </span>
      <span className="text-[10px] text-neutral-500">
        {company.verified ? "Verified · " : ""}
        {company.trust_level}
        {partners > 0 ? ` · ${partners} partners` : ""}
      </span>
      <span className="text-[10px] font-semibold tracking-[0.08em] text-neutral-400 uppercase">
        Hansala
      </span>
    </a>
  );
}
