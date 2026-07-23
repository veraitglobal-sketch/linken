import Link from "next/link";
import Image from "next/image";
import type { CaseStudy } from "@/types/case-study";

type Props = { caseStudy: CaseStudy };

export function DossierClientSeal({ caseStudy }: Props) {
  const confirmed = caseStudy.clientConfirmation?.status === "confirmed";
  const client = caseStudy.clientConfirmation?.confirmedBy;
  if (!confirmed || !client) return null;

  return (
    <section className="mb-12 flex items-center gap-4 border-b border-[var(--cf-line)] pb-10">
      <Link href={`/c/${client.slug}`} className="flex items-center gap-3 group">
        <span className="flex h-12 w-12 items-center justify-center overflow-hidden bg-white">
          {client.logoUrl ? (
            <Image src={client.logoUrl} alt="" width={48} height={48} className="object-cover" />
          ) : (
            <span className="text-[12px] font-semibold">{client.logoInitials}</span>
          )}
        </span>
        <span>
          <span className="block text-[15px] font-medium text-[var(--cf-ink)] group-hover:underline">
            {client.name}
          </span>
          <span className="text-[12px] text-[var(--cf-muted)]">Confirmed client</span>
        </span>
      </Link>
    </section>
  );
}
