type Props = {
  publishedByMe: boolean;
  publishedByThem: boolean;
  hasWebsite: boolean;
};

export function PartnerCreditStatus({
  publishedByMe,
  publishedByThem,
  hasWebsite,
}: Props) {
  if (!hasWebsite) {
    return <p className="mt-0.5 text-[12px] text-muted">They need a website first</p>;
  }

  const mine = publishedByMe ? "You published them" : "Not on site yet";
  const theirs = publishedByThem
    ? "They published you"
    : "They have not published you";

  return (
    <p className="mt-0.5 text-[12px] text-muted">
      {mine} · {theirs}
    </p>
  );
}
