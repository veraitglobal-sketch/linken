import Image from "next/image";
import Link from "next/link";
import type { CaseStudy } from "@/types/case-study";

type Props = { caseStudy: CaseStudy };

export function CaseStudyClientContext({ caseStudy }: Props) {
  const confirmed = caseStudy.clientConfirmation?.status === "confirmed";
  const client = caseStudy.clientConfirmation?.confirmedBy;
  if (!confirmed || !client) return null;

  return (
    <section className="rounded-[28px] border border-[#1a5c51]/25 bg-[#1a5c51]/6 px-7 py-7 sm:px-9">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-blue uppercase">
        Verified client
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <Link
          href={`/c/${client.slug}`}
          className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 transition-shadow hover:shadow-md"
        >
          <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-paper text-[13px] font-bold text-ink">
            {client.logoUrl ? (
              <Image
                src={client.logoUrl}
                alt=""
                width={44}
                height={44}
                className="h-full w-full object-cover"
              />
            ) : (
              client.logoInitials
            )}
          </span>
          <span>
            <span className="block text-[15px] font-semibold text-ink">
              {client.name}
            </span>
            <span className="text-[12px] text-muted">
              Confirmed this project on Hansala →
            </span>
          </span>
        </Link>
        <p className="max-w-md text-[14px] leading-relaxed text-ink-soft">
          This is not a logo on a slide. The receiving company verified that
          this delivery happened — on the same network you are browsing now.
        </p>
      </div>
    </section>
  );
}
