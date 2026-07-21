import Link from "next/link";
import { PRODUCT } from "@/lib/product-model";

type Props = { companySlug: string };

/** When the graph is still empty — still show the Map as part of Company. */
export function CompanyMapTeaser({ companySlug }: Props) {
  return (
    <section className="mx-auto mt-5 max-w-6xl scroll-mt-28 px-4">
      <div className="rounded-[28px] border border-line bg-surface px-5 py-8 sm:px-7">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
          {PRODUCT.map.label}
        </p>
        <h2 className="mt-2 font-display text-[clamp(1.4rem,2.4vw,1.75rem)] font-medium tracking-[-0.035em] text-ink">
          Your connections live here
        </h2>
        <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-muted">
          {PRODUCT.map.job} Add partners on this page first.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={`/c/${companySlug}?add=1#partners`}
            className="inline-flex h-9 items-center rounded-xl bg-navy px-3.5 text-[12px] font-semibold text-white"
          >
            Add partner
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center rounded-xl border border-line px-3.5 text-[12px] font-semibold text-ink"
          >
            Open {PRODUCT.map.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
