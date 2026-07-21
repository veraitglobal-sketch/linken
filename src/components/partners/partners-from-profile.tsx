import Link from "next/link";
import { PRODUCT } from "@/lib/product-model";

type Props = {
  companySlug: string;
};

/** When invite tool is opened from the profile — keep the loop closed. */
export function PartnersFromProfile({ companySlug }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-paper/60 px-4 py-3.5">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold tracking-[0.12em] text-plus uppercase">
          From {PRODUCT.company.label}
        </p>
        <p className="mt-0.5 text-[13px] text-muted">
          {PRODUCT.partners.job}
        </p>
      </div>
      <Link
        href={`/c/${companySlug}#partners`}
        className="shrink-0 text-[12px] font-semibold text-ink underline-offset-2 hover:underline"
      >
        Back to company
      </Link>
    </div>
  );
}
