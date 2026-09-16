import { ConfirmedNetworkStrip } from "@/components/company/confirmed-network-strip";
import type { Partner } from "@/types/partner";

type Props = {
  companySlug: string;
  companyName: string;
  partners: Partner[];
};

/** Reciprocal confirmed network under the public profile. */
export function CompanyProfileNetwork({
  companySlug,
  companyName,
  partners,
}: Props) {
  return (
    <ConfirmedNetworkStrip
      companySlug={companySlug}
      companyName={companyName}
      partners={partners}
    />
  );
}
