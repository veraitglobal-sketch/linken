import Link from "next/link";
import { Badge } from "@/components/ui/badge";

type Props = {
  name: string;
  slug: string;
  verified: boolean;
  trustLevel?: string;
  wouldWorkAgain?: string | null;
};

/** Evidence card above an intro message — never shows Radar/paid status. */
export function IntroProof({
  name,
  slug,
  verified,
  trustLevel,
  wouldWorkAgain,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/c/${slug}`}
        className="text-[15px] font-semibold text-ink underline-offset-2 hover:underline"
      >
        {name}
      </Link>
      {verified ? <Badge tone="success">Verified</Badge> : null}
      {trustLevel && trustLevel !== "Member" ? (
        <Badge tone="neutral">{trustLevel}</Badge>
      ) : null}
      {wouldWorkAgain ? (
        <span className="text-[12px] text-muted">{wouldWorkAgain}</span>
      ) : null}
    </div>
  );
}
