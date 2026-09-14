import {
  partnershipAnnouncement,
} from "@/features/certificate/copy";
import type { PartnershipCertificate } from "@/features/certificate/queries";

type Props = {
  data: PartnershipCertificate;
};

export function CertificateStatement({ data }: Props) {
  return (
    <div className="mx-auto max-w-[32rem] text-center">
      <p className="text-[15px] leading-relaxed text-ink-soft sm:text-[17px]">
        {partnershipAnnouncement(
          data.left.name,
          data.right.name,
          data.confirmedAt,
        )}
      </p>
      <p className="mt-4 text-[12px] leading-relaxed text-muted">
        Marks on this record belong to the companies that confirmed. This is
        not a rating, a rank, or an endorsement by Hansala.
      </p>
    </div>
  );
}
