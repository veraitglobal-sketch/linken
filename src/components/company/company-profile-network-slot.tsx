import { CompanyProfileNetwork } from "@/components/company/company-profile-network";
import type { Partner } from "@/types/partner";

type Props = {
  companySlug: string;
  companyName: string;
  partners: Partner[];
};

/** Confirmed network under the public profile. */
export async function CompanyProfileNetworkSlot({
  companySlug,
  companyName,
  partners,
}: Props) {
  return (
    <CompanyProfileNetwork
      companySlug={companySlug}
      companyName={companyName}
      partners={partners}
    />
  );
}
