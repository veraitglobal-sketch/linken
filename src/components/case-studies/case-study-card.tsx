import Image from "next/image";
import Link from "next/link";
import { ClientConfirmedChip } from "@/components/case-studies/client-confirmed-chip";
import { caseStudyCoverFocus, caseStudyCoverUrl } from "@/lib/case-study-cover";
import type { CaseStudy } from "@/types/case-study";
import type { Company } from "@/types/company";

type Props = {
  companySlug: string;
  caseStudy: CaseStudy;
  company: Pick<Company, "verified" | "name">;
  index: number;
  featured?: boolean;
};

export function CaseStudyCard({
  companySlug,
  caseStudy,
  index,
  featured = false,
}: Props) {
  const href = `/c/${companySlug}/case-studies/${caseStudy.slug}`;
  const cover = caseStudyCoverUrl(caseStudy.coverImageUrl, index);
  const confirmed = caseStudy.clientConfirmation?.status === "confirmed";

  if (featured) {
    return (
      <article className="group">
        <Link href={href} className="relative block aspect-[16/10] overflow-hidden bg-[#0a1210] sm:aspect-[2/1]">
          <Image
            src={cover}
            alt=""
            fill
            className={`object-cover transition-transform duration-[1.2s] group-hover:scale-[1.03] ${caseStudyCoverFocus(index)}`}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060a09]/90 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
            <p className="text-[12px] tracking-[0.1em] text-white/45 uppercase">
              {caseStudy.year}
              {caseStudy.location ? ` · ${caseStudy.location}` : ""}
            </p>
            <h3 className="mt-3 max-w-2xl font-display text-[clamp(1.75rem,4vw,3rem)] font-medium leading-[0.95] tracking-[-0.04em] text-white">
              {caseStudy.title}
            </h3>
            {confirmed ? (
              <div className="mt-4">
                <ClientConfirmedChip onDark />
              </div>
            ) : null}
          </div>
        </Link>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-soft">{caseStudy.summary}</p>
      </article>
    );
  }

  return (
    <article className="group border-t border-line py-6">
      <Link href={href} className="grid gap-4 sm:grid-cols-[140px_1fr] sm:items-center">
        <div className="relative aspect-[4/3] overflow-hidden bg-paper sm:aspect-square">
          <Image src={cover} alt="" fill className="object-cover" sizes="140px" />
        </div>
        <div>
          <p className="text-[12px] text-muted">
            {caseStudy.year}
            {caseStudy.location ? ` · ${caseStudy.location}` : ""}
          </p>
          <h3 className="mt-1 font-display text-xl font-medium tracking-[-0.03em] text-ink group-hover:underline">
            {caseStudy.title}
          </h3>
          {confirmed ? (
            <div className="mt-2">
              <ClientConfirmedChip />
            </div>
          ) : null}
          <p className="mt-2 line-clamp-2 text-[14px] text-ink-soft">{caseStudy.summary}</p>
        </div>
      </Link>
    </article>
  );
}
