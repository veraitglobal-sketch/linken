import Link from "next/link";
import Image from "next/image";
import type { CaseStudy } from "@/types/case-study";

type Props = { caseStudy: CaseStudy };

export function DossierClientSeal({ caseStudy }: Props) {
  const confirmed = caseStudy.clientConfirmation?.status === "confirmed";
  const client = caseStudy.clientConfirmation?.confirmedBy;
  if (!confirmed || !client) return null;

  return (
    <section className="rounded-[24px] border-2 border-dashed border-blue/30 bg-[#1a5c51]/6 p-6 sm:p-8">
      <p className="font-mono text-[11px] tracking-[0.18em] text-blue uppercase">
        Client seal applied
      </p>
      <Link
        href={`/c/${client.slug}`}
        className="mt-4 inline-flex items-center gap-4"
      >
        <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-surface shadow-md">
          {client.logoUrl ? (
            <Image src={client.logoUrl} alt="" width={56} height={56} className="object-cover" />
          ) : (
            <span className="text-sm font-bold">{client.logoInitials}</span>
          )}
        </span>
        <span>
          <span className="block font-display text-xl font-medium text-ink">
            {client.name}
          </span>
          <span className="text-[13px] text-blue">Verified receiving company →</span>
        </span>
      </Link>
    </section>
  );
}
