import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogoTile } from "@/components/ui/logo-tile";
import type { ListingCompany } from "@/features/acquisition/listing-companies";

type Props = {
  listings: ListingCompany[];
};

/** Optional claim path after confirm — listings already confirmed publicly. */
export function PostConfirmListings({ listings }: Props) {
  const count = listings.length;
  if (count === 0) {
    return (
      <>
        <h3 className="font-display text-xl font-medium tracking-[-0.03em] text-ink">
          Optional next step
        </h3>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
          Creating a profile is free and under your control. We do not publish a
          public draft for you unless you claim an invite or create a company
          yourself.
        </p>
      </>
    );
  }

  return (
    <>
      <h3 className="font-display text-xl font-medium tracking-[-0.03em] text-ink">
        {count === 1
          ? "1 company already lists you"
          : `${count} companies already list you`}
      </h3>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
        Optional: claim your profile so those links point to a page you own.
        Nothing is created or emailed without your action.
      </p>
      <ul className="mt-5 flex flex-wrap gap-3">
        {listings.map((c) => (
          <li key={c.id}>
            <Link
              href={`/c/${c.slug}`}
              className="inline-flex rounded-xl border border-line bg-paper/50 px-2.5 py-2 hover:border-ink/20"
            >
              <LogoTile
                name={c.name}
                initials={c.logoInitials}
                logoUrl={c.logoUrl}
                website={null}
                showName
                size="sm"
              />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
