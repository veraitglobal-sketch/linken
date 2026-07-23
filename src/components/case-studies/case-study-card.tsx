import Image from "next/image";
import Link from "next/link";
import { ClientConfirmedChip } from "@/components/case-studies/client-confirmed-chip";
import { dossierFileId, dossierProofScore } from "@/lib/case-study-dossier";
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
  company,
  index,
  featured = false,
}: Props) {
  const href = `/c/${companySlug}/case-studies/${caseStudy.slug}`;
  const cover = caseStudyCoverUrl(caseStudy.coverImageUrl, index);
  const confirmed = caseStudy.clientConfirmation?.status === "confirmed";
  const fileId = dossierFileId(caseStudy.slug, caseStudy.year);
  const { score, total, stamp } = dossierProofScore(caseStudy, {
    name: company.name ?? "",
    verified: company.verified,
  });

  if (featured) {
    return (
      <article className="group relative">
        <div className="absolute -top-3 left-6 z-10 rounded-t-xl border border-b-0 border-line bg-paper px-4 py-2 font-mono text-[10px] tracking-[0.12em] text-muted uppercase">
          Dossier {fileId}
        </div>
        <div className="overflow-hidden rounded-[28px] border border-line bg-navy shadow-[0_24px_64px_rgba(8,20,18,0.16)]">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            <Link href={href} className="relative block min-h-[300px] lg:min-h-[440px]">
              <Image
                src={cover}
                alt=""
                fill
                className={`object-cover ${caseStudyCoverFocus(index)}`}
                sizes="600px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy-deep/20 to-transparent" />
              <span className="absolute left-5 top-5 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[10px] font-bold tracking-[0.1em] text-white/70 uppercase">
                {stamp === "verified" ? "Verified" : `${score}/${total} layers`}
              </span>
            </Link>
            <div className="flex flex-col justify-between px-7 py-8 lg:px-9 lg:py-10">
              <div>
                <h3 className="font-display text-[clamp(1.75rem,3vw,2.35rem)] font-medium tracking-[-0.04em] text-white">
                  <Link href={href}>{caseStudy.title}</Link>
                </h3>
                {caseStudy.highlightStat ? (
                  <p className="mt-3 font-display text-xl text-ember">{caseStudy.highlightStat}</p>
                ) : null}
                {confirmed ? (
                  <div className="mt-4">
                    <ClientConfirmedChip onDark />
                  </div>
                ) : null}
                <p className="mt-5 line-clamp-3 text-[15px] leading-relaxed text-white/65">
                  {caseStudy.summary}
                </p>
              </div>
              <Link
                href={href}
                className="mt-8 inline-flex h-11 w-fit items-center rounded-xl bg-white px-5 text-[13px] font-semibold text-ink"
              >
                Open dossier →
              </Link>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex gap-0 overflow-hidden rounded-[20px] border border-line bg-surface shadow-sm transition-shadow hover:shadow-md">
      <div className="flex w-10 shrink-0 flex-col items-center border-r border-line bg-paper py-4">
        <span className="-rotate-90 whitespace-nowrap font-mono text-[9px] tracking-[0.14em] text-muted uppercase">
          {fileId.slice(-8)}
        </span>
      </div>
      <Link href={href} className="grid min-w-0 flex-1 sm:grid-cols-[160px_1fr]">
        <div className="relative hidden aspect-square overflow-hidden sm:block">
          <Image src={cover} alt="" fill className="object-cover" sizes="160px" />
        </div>
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 text-[11px] text-muted">
            <span>{caseStudy.year}</span>
            {caseStudy.location ? <span>· {caseStudy.location}</span> : null}
            <span className="ml-auto font-mono text-[10px]">{score}/{total}</span>
          </div>
          <h3 className="mt-1 font-display text-xl font-medium tracking-[-0.03em] text-ink">
            {caseStudy.title}
          </h3>
          {confirmed ? (
            <div className="mt-2">
              <ClientConfirmedChip />
            </div>
          ) : null}
          <p className="mt-2 line-clamp-2 text-[13px] text-ink-soft">{caseStudy.summary}</p>
        </div>
      </Link>
    </article>
  );
}
