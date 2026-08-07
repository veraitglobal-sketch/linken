type Props = {
  verified: boolean;
  verifiedAt?: string | null;
  claimed?: boolean;
};

/** Plain-language verified meaning — factual, never judgemental. */
export function VerifiedStatusNote({
  verified,
  verifiedAt,
  claimed = true,
}: Props) {
  if (!claimed) {
    return (
      <p className="mt-2 max-w-md text-[12px] leading-relaxed text-white/45">
        Unclaimed draft. Anyone can request a claim link with the invite email
        — nothing here is confirmed by the company yet.
      </p>
    );
  }

  if (!verified) {
    return (
      <p className="mt-2 max-w-md text-[12px] leading-relaxed text-white/45">
        Domain not yet verified. Confirmed partners and clients still appear
        when both sides accept — verification proves control of the business
        domain, not service quality.
      </p>
    );
  }

  const year = verifiedAt
    ? new Date(verifiedAt).getFullYear()
    : null;

  return (
    <p className="mt-2 max-w-md text-[12px] leading-relaxed text-white/45">
      Verified
      {year ? ` · ${year}` : ""}: this company proved control of its business
      domain or approved identity on Hansala. It is not a paid badge and not a
      quality guarantee.
    </p>
  );
}
