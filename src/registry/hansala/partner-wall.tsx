import {
  getJson,
  initials,
  profileHref,
  requestViaHost,
} from "./lib";

type Partner = { name: string; slug: string; verified: boolean };
type PartnersRes = { partners: Partner[]; count: number };

type Props = { slug: string };

/**
 * Confirmed partners for a Hansala company.
 * RSC — fetches the public API server-side (no API key).
 * Renders null when there are no confirmed partners.
 */
export async function PartnerWall({ slug }: Props) {
  const trimmed = slug.trim();
  if (!trimmed) return null;

  const data = await getJson<PartnersRes>(
    `/api/v1/companies/${encodeURIComponent(trimmed)}/partners`,
    { next: { revalidate: 300 } },
  );
  const partners = data?.partners ?? [];
  if (partners.length === 0) return null;

  const via = await requestViaHost();
  const href = profileHref(trimmed, via);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block no-underline"
    >
      <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-4">
        <p className="text-[10px] font-semibold tracking-[0.12em] text-neutral-500 uppercase">
          Confirmed partners
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {partners.slice(0, 12).map((p) => (
            <li
              key={p.slug}
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-2.5 py-1.5"
            >
              <span
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-900/5 text-[10px] font-semibold text-neutral-700"
                aria-hidden
              >
                {initials(p.name)}
              </span>
              <span className="max-w-[10rem] truncate text-[12px] font-medium text-neutral-900">
                {p.name}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] text-neutral-500">
          Verified on Hansala · {partners.length} partner
          {partners.length === 1 ? "" : "s"}
        </p>
      </div>
    </a>
  );
}
