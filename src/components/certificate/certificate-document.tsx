import { CertificateCases } from "@/components/certificate/certificate-cases";
import { CertificateFacts } from "@/components/certificate/certificate-facts";
import { CertificateLetterhead } from "@/components/certificate/certificate-letterhead";
import { CertificateParties } from "@/components/certificate/certificate-parties";
import { CertificateStatement } from "@/components/certificate/certificate-statement";
import { displayRecordUrl } from "@/features/certificate/format";
import type { PartnershipCertificate } from "@/features/certificate/queries";

type Props = {
  data: PartnershipCertificate;
  recordUrl: string;
  qrDataUri: string;
};

export function CertificateDocument({ data, recordUrl, qrDataUri }: Props) {
  return (
    <article className="certificate-sheet mx-auto flex max-w-[210mm] flex-col bg-white px-8 pt-9 pb-12 text-ink sm:px-12 sm:pt-11 sm:pb-14">
      <CertificateLetterhead />
      <div className="mt-10 flex flex-1 flex-col">
        <p className="text-center text-[11px] font-semibold tracking-[0.16em] text-blue uppercase">
          Mutual confirmation
        </p>
        <div className="mt-8">
          <CertificateParties left={data.left} right={data.right} />
        </div>
        <div className="mt-8 sm:mt-10">
          <CertificateStatement data={data} />
        </div>
        <CertificateFacts confirmedAt={data.confirmedAt} />
        <CertificateCases cases={data.sharedCaseList} />
      </div>
      <footer className="mt-10 flex flex-wrap items-end justify-between gap-6 border-t border-navy/15 pt-8">
        <div className="min-w-0 max-w-sm">
          <p className="text-[10px] font-semibold tracking-[0.16em] text-blue uppercase">
            Verify this record
          </p>
          <p className="mt-2 break-all font-mono text-[12px] leading-relaxed text-ink-soft">
            {displayRecordUrl(recordUrl)}
          </p>
          <p className="mt-2 text-[12px] leading-relaxed text-muted">
            Scan the code. If this partnership ends, the live page is removed.
          </p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrDataUri}
          alt={`QR code to verify ${data.left.name} and ${data.right.name} on Hansala`}
          width={104}
          height={104}
          className="rounded-[2px] border border-navy/15"
        />
      </footer>
    </article>
  );
}
