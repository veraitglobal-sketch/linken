import Link from "next/link";
import { CertificateShare } from "@/components/certificate/certificate-share";
import { PrintButton } from "@/components/one-pager/print-button";
import { companyPath } from "@/features/seo/paths";

type Party = { name: string; slug: string };

export function CertificateToolbar({
  announcement,
  recordUrl,
  left,
  right,
}: {
  announcement: string;
  recordUrl: string;
  left: Party;
  right: Party;
}) {
  return (
    <div className="mx-auto flex max-w-[210mm] flex-wrap items-center justify-between gap-3 px-4 pt-6 print:hidden sm:px-0">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.16em] text-blue uppercase">
          Partnership record
        </p>
        <p className="mt-1 text-[13px] text-ink-soft">
          Attach this to a proposal.
        </p>
        <p className="mt-2 text-[13px]">
          <Link
            href={companyPath(left.slug)}
            className="font-medium text-ink underline-offset-2 hover:underline"
          >
            {left.name}
          </Link>
          <span className="text-muted"> · </span>
          <Link
            href={companyPath(right.slug)}
            className="font-medium text-ink underline-offset-2 hover:underline"
          >
            {right.name}
          </Link>
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <PrintButton />
        <CertificateShare announcement={announcement} recordUrl={recordUrl} />
      </div>
    </div>
  );
}
