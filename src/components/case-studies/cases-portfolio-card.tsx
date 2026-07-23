import Image from "next/image";
import Link from "next/link";
import { dossierFileId, dossierProofScore } from "@/lib/case-study-dossier";
import { caseStudyCoverFocus, caseStudyCoverUrl } from "@/lib/case-study-cover";
import type { CaseStudy } from "@/types/case-study";
import type { Company } from "@/types/company";

type Props = {
  companySlug: string;
  company: Pick<Company, "verified" | "name">;
  caseStudy: CaseStudy;
  index: number;
};

export function CasesPortfolioCard({ companySlug, company, caseStudy, index }: Props) {
  const cover = caseStudyCoverUrl(caseStudy.coverImageUrl, index);
  const confirmed = caseStudy.clientConfirmation?.status === "confirmed";
  const fileId = dossierFileId(caseStudy.slug, caseStudy.year);
  const { score, total } = dossierProofScore(caseStudy, {
    name: "",
    verified: company.verified,
  });

  return (
    <article className="group relative overflow-hidden rounded-[22px] border border-line bg-surface shadow-sm transition-shadow hover:shadow-lg">
      <div className="absolute left-4 top-0 z-10 -translate-y-1/2 rounded-md border border-line bg-paper px-2 py-1 font-mono text-[9px] tracking-[0.1em] text-muted">
        {fileId}
      </div>
      <Link
        href={`/dashboard/cases/${caseStudy.slug}`}
        className="relative block aspect-[16/10] overflow-hidden bg-paper"
      >
        <Image
          src={cover}
          alt=""
          fill
          className={`object-cover transition-transform duration-700 group-hover:scale-[1.03] ${caseStudyCoverFocus(index)}`}
          sizes="360px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="font-mono text-[10px] text-white/50">{score}/{total} layers</p>
          <h3 className="mt-1 font-display text-lg font-medium text-white line-clamp-2">
            {caseStudy.title}
          </h3>
        </div>
      </Link>

      <div className="space-y-3 p-4">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.08em] uppercase ${
            confirmed ? "bg-blue/10 text-blue" : "bg-paper text-muted"
          }`}
        >
          {confirmed ? "Client sealed" : "Awaiting seal"}
        </span>
        <p className="line-clamp-2 text-[13px] text-ink-soft">
          {caseStudy.summary || "Open the evidence board to file this dossier."}
        </p>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/cases/${caseStudy.slug}`}
            className="inline-flex h-9 flex-1 items-center justify-center rounded-xl bg-accent text-[12px] font-semibold text-white"
          >
            Evidence board
          </Link>
          <Link
            href={`/c/${companySlug}/case-studies/${caseStudy.slug}`}
            className="inline-flex h-9 flex-1 items-center justify-center rounded-xl border border-line text-[12px] font-semibold text-ink"
          >
            Dossier
          </Link>
        </div>
      </div>
    </article>
  );
}
