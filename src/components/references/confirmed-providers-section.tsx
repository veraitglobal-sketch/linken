import Link from "next/link";
import { LogoTile } from "@/components/ui/logo-tile";
import type { ServiceReference } from "@/types/service-reference";
import { initialsFromName } from "@/features/team/types";

type Props = {
  providers: ServiceReference[];
};

/**
 * Reciprocal view — confirmed providers listing this firm as client.
 * Pending never shown.
 */
export function ConfirmedProvidersSection({ providers }: Props) {
  if (providers.length === 0) return null;

  return (
    <section className="rounded-[28px] border border-line bg-surface px-5 py-6 sm:px-7 sm:py-7">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
        Verified work
      </p>
      <h2 className="mt-2 font-display text-[clamp(1.45rem,2.4vw,1.85rem)] font-medium tracking-[-0.035em] text-ink">
        Companies we work with
      </h2>
      <p className="mt-2 max-w-xl text-[13px] text-ink-soft">
        Confirmed by both sides. This firm is listed as the client on these
        relationships.
      </p>
      <ul className="mt-5 flex flex-col gap-2.5">
        {providers.map((p) => (
          <li
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-paper/40 px-4 py-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              {p.clientSlug ? (
                <Link
                  href={`/c/${p.clientSlug}`}
                  className="min-w-0 hover:opacity-90"
                >
                  <LogoTile
                    name={p.clientName}
                    initials={initialsFromName(p.clientName)}
                    logoUrl={p.clientLogoUrl}
                    website={p.clientWebsite}
                    showName
                    size="sm"
                  />
                </Link>
              ) : (
                <LogoTile
                  name={p.clientName}
                  initials={initialsFromName(p.clientName)}
                  logoUrl={p.clientLogoUrl}
                  website={p.clientWebsite}
                  showName
                  size="sm"
                />
              )}
            </div>
            <div className="text-right text-[13px] text-ink-soft">
              <p className="font-medium text-ink">{p.service}</p>
              <p className="mt-0.5 text-[12px] text-muted">
                {p.ongoing
                  ? `Since ${p.startedYear} · ongoing`
                  : `${p.startedYear}${p.endedYear ? `–${p.endedYear}` : ""}`}
                {" · Confirmed"}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
