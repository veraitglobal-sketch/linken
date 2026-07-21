import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { methodLabel } from "@/components/verification/verification-flash";

type Props = {
  domain: string;
  method: string | null;
  verifiedDate: string | null;
  companySlug: string;
};

/** Calm success state when domain is already verified. */
export function VerificationDone({
  domain,
  method,
  verifiedDate,
  companySlug,
}: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_0_rgba(8,20,18,0.03)]">
      <div className="border-b border-line bg-accent-soft/60 px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.14em] text-plus uppercase">
              Domain verification
            </p>
            <h2 className="mt-1 font-display text-[18px] font-semibold tracking-[-0.03em] text-ink">
              {domain} is verified
            </h2>
            <p className="mt-1 text-[12px] leading-relaxed text-muted">
              Next: invite a partner so they appear on your Network after they
              accept.
              {verifiedDate ? ` Confirmed ${verifiedDate}.` : ""}
            </p>
          </div>
          <Badge
            tone="success"
            className="text-[10px] tracking-[0.06em] uppercase"
          >
            Verified
            {method ? ` · ${methodLabel(method)}` : ""}
          </Badge>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 px-5 py-4 sm:px-6">
        <Link
          href="/dashboard/partners?verified=1"
          className="inline-flex h-9 items-center rounded-xl bg-navy px-3.5 text-[12px] font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          Invite a partner
        </Link>
        <Link
          href={`/c/${companySlug}`}
          className="inline-flex h-9 items-center rounded-xl border border-line bg-surface px-3.5 text-[12px] font-semibold text-ink transition-colors hover:bg-paper"
        >
          View public profile
        </Link>
      </div>
    </section>
  );
}
