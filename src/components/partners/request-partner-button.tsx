import { PartnerInviteButton } from "@/components/partners/partner-invite-button";

type Props = {
  companySlug: string;
  companyName: string;
  back?: string;
  disabledReason?: string | null;
};

/** Alias — real partnership request via requestPartnership. */
export function RequestPartnerButton({
  companySlug,
  companyName,
  back = "/dashboard/partners",
  disabledReason,
}: Props) {
  return (
    <PartnerInviteButton
      companySlug={companySlug}
      companyName={companyName}
      back={back}
      disabledReason={disabledReason}
    />
  );
}
