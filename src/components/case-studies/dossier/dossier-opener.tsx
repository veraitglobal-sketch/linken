import Image from "next/image";
import Link from "next/link";
import { ClientConfirmedBadge } from "@/components/case-studies/client-confirmed-badge";
import { caseStudyCoverFocus, caseStudyCoverUrl } from "@/lib/case-study-cover";
import { dossierFileId, dossierProofScore } from "@/lib/case-study-dossier";
import type { CaseStudy } from "@/types/case-study";
import type { Company } from "@/types/company";

type Props = {
  company: Company;
  caseStudy: CaseStudy;
  index?: number;
};

const STAMP: Record<string, { label: string; className: string }> = {
  verified: {
    label: "Verified dossier",
    className: "border-blue/40 bg-blue/15 text-blue-soft",
  },
  partial: {
    label: "Partially verified",
    className: "border-ember/35 bg-ember/10 text-ember",
  },
  open: {
    label: "Open file",
    className: "border-white/20 bg-white/5 text-white/55",
  },
};

export function DossierOpener({ company, caseStudy, index = 0 }: Props) {
  const cover = caseStudyCoverUrl(caseStudy.coverImageUrl, index);
  const { stamp } = dossierProofScore(caseStudy, company);
  const badge = STAMP[stamp] ?? STAMP.open;
  const fileId = dossierFileId(caseStudy.slug, caseStudy.year);
  const confirmed = caseStudy.clientConfirmation?.status === "confirmed";

  return (
    <header className="relative overflow-hidden bg-navy-deep text-white">
      <div className="stage-grain absolute inset-0 opacity-50" />
      <div className="relative mx-auto grid max-w-[1400px] lg:grid-cols-[1fr_1.05fr]">
        <div className="flex flex-col justify-between px-5 py-10 sm:px-8 lg:py-14 lg:pl-10">
          <div>
            <Link
              href={`/c/${company.slug}`}
              className="text-[12px] font-medium text-white/45 hover:text-white/70"
            >
              ← {company.name}
            </Link>
            <p className="mt-8 font-mono text-[11px] tracking-[0.2em] text-blue-soft uppercase">
              Hansala verified dossier
            </p>
            <p className="mt-2 font-mono text-[13px] text-white/35">{fileId}</p>
            <span
              className={`mt-4 inline-flex rounded-full border px-3 py-1 text-[10px] font-bold tracking-[0.14em] uppercase ${badge.className}`}
            >
              {badge.label}
            </span>
          </div>

          <div className="mt-10 lg:mt-0">
            <h1 className="font-display text-[clamp(2.4rem,6vw,4.5rem)] font-medium leading-[0.92] tracking-[-0.05em]">
              {caseStudy.title}
            </h1>
            {caseStudy.highlightStat ? (
              <p className="mt-5 font-display text-[clamp(1.2rem,2.5vw,1.85rem)] font-medium tracking-[-0.03em] text-ember">
                {caseStudy.highlightStat}
              </p>
            ) : null}
            <p className="mt-6 max-w-xl text-[16px] leading-[1.75] text-white/62">
              {caseStudy.summary}
            </p>
            {confirmed && caseStudy.clientConfirmation ? (
              <div className="mt-7">
                <ClientConfirmedBadge confirmation={caseStudy.clientConfirmation} />
              </div>
            ) : null}
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 sm:grid-cols-4">
            <Meta label="Year" value={caseStudy.year || "—"} />
            <Meta label="Location" value={caseStudy.location || "—"} />
            <Meta label="Sector" value={caseStudy.sector || "—"} />
            <Meta label="Duration" value={caseStudy.duration || "—"} />
          </dl>
        </div>

        <div className="relative min-h-[320px] lg:min-h-[min(92svh,780px)]">
          <Image
            src={cover}
            alt=""
            fill
            priority
            className={`object-cover ${caseStudyCoverFocus(index)}`}
            sizes="(max-width: 1024px) 100vw, 720px"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-deep via-navy-deep/20 to-transparent lg:via-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 via-transparent to-transparent lg:hidden" />
        </div>
      </div>
    </header>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold tracking-[0.12em] text-white/35 uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-[14px] font-medium text-white/85">{value}</dd>
    </div>
  );
}
