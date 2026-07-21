import Link from "next/link";
import { PRODUCT } from "@/lib/product-model";

type Props = {
  companySlug: string;
  error?: string;
  invited?: string;
  created?: string;
};

/** Partner-loop flashes when returning to the profile from invite tool. */
export function ProfilePartnerFlashes({
  companySlug,
  error,
  invited,
  created,
}: Props) {
  if (!error && !invited && !created) return null;

  return (
    <div className="mx-auto mt-4 max-w-6xl space-y-2 px-4">
      {error ? (
        <p className="rounded-2xl border border-ember/35 bg-ember/10 px-4 py-3 text-sm text-ink">
          {error}
        </p>
      ) : null}
      {invited ? (
        <p className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-ink">
          Request sent to{" "}
          <Link
            href={`/c/${invited}`}
            className="font-semibold underline-offset-2 hover:underline"
          >
            {invited}
          </Link>
          . Official on {PRODUCT.map.label} after they accept.{" "}
          <Link
            href={`/c/${companySlug}?add=1#add-partner`}
            className="font-semibold underline-offset-2 hover:underline"
          >
            Invite another
          </Link>
        </p>
      ) : null}
      {created ? (
        <p className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-ink">
          Draft invite created for{" "}
          <Link
            href={`/c/${created}`}
            className="font-semibold underline-offset-2 hover:underline"
          >
            {created}
          </Link>
          . Pending until they claim and confirm.
        </p>
      ) : null}
    </div>
  );
}
