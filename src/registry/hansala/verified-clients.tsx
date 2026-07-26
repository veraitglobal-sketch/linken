import {
  getJson,
  initials,
  profileHref,
  requestViaHost,
} from "./lib";

type Ref = {
  client_name: string;
  service: string;
  ongoing: boolean;
  started_year: string;
};
type RefsRes = { references: Ref[]; count: number };

type Props = { slug: string };

/**
 * Confirmed client references for a Hansala company.
 * RSC — public API only, slug prop, no API key.
 * Renders null when there are no confirmed clients.
 */
export async function VerifiedClients({ slug }: Props) {
  const trimmed = slug.trim();
  if (!trimmed) return null;

  const data = await getJson<RefsRes>(
    `/api/v1/companies/${encodeURIComponent(trimmed)}/references`,
    { next: { revalidate: 300 } },
  );
  const refs = data?.references ?? [];
  if (refs.length === 0) return null;

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
          Confirmed clients
        </p>
        <ul className="mt-3 space-y-2">
          {refs.slice(0, 6).map((r) => (
            <li key={`${r.client_name}-${r.service}`} className="flex items-center gap-2.5">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-900/5 text-[10px] font-semibold text-neutral-700"
                aria-hidden
              >
                {initials(r.client_name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-medium text-neutral-900">
                  {r.client_name}
                </p>
                <p className="truncate text-[11px] text-neutral-500">
                  {r.service}
                  {r.ongoing && r.started_year
                    ? ` · since ${r.started_year}`
                    : null}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] text-neutral-500">
          Verified on Hansala · {refs.length} confirmed
        </p>
      </div>
    </a>
  );
}
