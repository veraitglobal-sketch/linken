import Link from "next/link";
import { PartnerFlash } from "@/components/partners/partner-flash";
import { PRODUCT } from "@/lib/product-model";

type Props = {
  verified: boolean;
  hasCompany: boolean;
  justVerified?: string;
  error?: string;
  created?: string;
  invited?: string;
  accepted?: string;
  declined?: string;
  resent?: string;
};

export function PartnerPageFlashes({
  verified,
  hasCompany,
  justVerified,
  error,
  created,
  invited,
  accepted,
  declined,
  resent,
}: Props) {
  return (
    <>
      {!verified && hasCompany ? (
        <PartnerFlash tone="warn">
          Verify your domain before sending or accepting partner requests.{" "}
          <Link
            href="/dashboard/verification"
            className="font-semibold underline-offset-2 hover:underline"
          >
            Verify domain
          </Link>
        </PartnerFlash>
      ) : null}

      {justVerified === "1" && verified ? (
        <PartnerFlash>
          Domain verified. Search a firm below — {PRODUCT.partners.job}
        </PartnerFlash>
      ) : null}

      {error ? <PartnerFlash tone="error">{error}</PartnerFlash> : null}
      {created ? (
        <PartnerFlash>
          Draft + invite sent for{" "}
          <a
            href={`/c/${created}`}
            className="font-semibold underline-offset-2 hover:underline"
          >
            {created}
          </a>
          . Pending until they claim and confirm.
        </PartnerFlash>
      ) : null}
      {invited ? (
        <PartnerFlash>
          Request sent to{" "}
          <a
            href={`/c/${invited}`}
            className="font-semibold underline-offset-2 hover:underline"
          >
            {invited}
          </a>
          . Official only after they accept.
        </PartnerFlash>
      ) : null}
      {accepted ? (
        <PartnerFlash>
          Partnership accepted — open{" "}
          <Link
            href="/dashboard"
            className="font-semibold underline-offset-2 hover:underline"
          >
            {PRODUCT.map.label}
          </Link>{" "}
          to see the partner link.
        </PartnerFlash>
      ) : null}
      {declined ? <PartnerFlash>Request declined.</PartnerFlash> : null}
      {resent ? (
        <PartnerFlash>
          Invite resent — they still need to join and confirm.
        </PartnerFlash>
      ) : null}
    </>
  );
}
