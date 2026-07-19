import Link from "next/link";
import { PartnerNetworkTile } from "@/components/partners/partner-network-tile";
import type { Company } from "@/types/company";
import type { Partner } from "@/types/partner";

type Props = {
  company: Company;
  partners: Partner[];
};

export function PartnerNetwork({ company, partners }: Props) {
  const verifiedCount = partners.filter((p) => p.verified).length;

  return (
    <div className="pb-10">
      <section className="px-4 pt-3">
        <div className="mesh-stage relative mx-auto max-w-6xl overflow-hidden rounded-[28px] px-6 py-8 text-white sm:px-9 sm:py-10">
          <div className="stage-grain absolute inset-0" />
          <div className="relative z-10">
            <Link
              href={`/c/${company.slug}`}
              className="text-[12px] font-medium text-white/55 transition-colors hover:text-white"
            >
              ← {company.name}
            </Link>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-ember" />
              <p className="text-[11px] font-semibold tracking-[0.16em] text-white/70 uppercase">
                Full network
              </p>
            </div>
            <h1 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] font-medium tracking-[-0.04em]">
              Partners & collaborators
            </h1>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/68">
              Every firm listed here confirmed the relationship with{" "}
              {company.name}. Open a profile to see their work and network.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-[13px] text-white/55">
              <p>
                <span className="font-semibold text-white">{partners.length}</span>{" "}
                partners
              </p>
              <p>
                <span className="font-semibold text-white">{verifiedCount}</span>{" "}
                verified
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-5 max-w-6xl px-4">
        <div className="mb-4 flex items-baseline justify-between gap-3 px-0.5">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
              Sorted by trust
            </p>
            <p className="mt-1 text-[13px] text-ink-soft">
              Verified first, then shared case studies.
            </p>
          </div>
        </div>

        {partners.length === 0 ? (
          <div className="rounded-[24px] border border-line bg-surface px-5 py-10 text-sm text-muted">
            No confirmed partners yet.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {partners.map((partner) => (
              <PartnerNetworkTile key={partner.id} partner={partner} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
