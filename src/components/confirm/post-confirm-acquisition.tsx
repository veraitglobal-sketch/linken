import Link from "next/link";
import { LogoTile } from "@/components/ui/logo-tile";
import { Button } from "@/components/ui/button";
import { seedOnboardingFromConfirm } from "@/features/acquisition/actions";
import type { ListingCompany } from "@/features/acquisition/listing-companies";

type Props = {
  listings: ListingCompany[];
  /** Suggested company name for create CTA. */
  suggestedName: string;
  /** Suggested website (from email domain). */
  suggestedWebsite: string;
  /** When the confirmer already has a claimed profile. */
  existingProfile?: { slug: string; name: string } | null;
};

/** Post-confirm acquisition: social proof + claim/create CTA. */
export function PostConfirmAcquisition({
  listings,
  suggestedName,
  suggestedWebsite,
  existingProfile = null,
}: Props) {
  const count = listings.length;
  const headline =
    count === 0
      ? "Your confirmation is on Hansala"
      : count === 1
        ? "1 company has listed you as a client"
        : `${count} companies have listed you as a client`;

  return (
    <div className="rounded-[24px] border border-line bg-surface px-5 py-7 sm:px-7">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
        Confirmed
      </p>
      <h2 className="mt-2 font-display text-[clamp(1.45rem,3vw,1.85rem)] font-medium tracking-[-0.035em] text-ink">
        {headline}
      </h2>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
        {count > 0
          ? "These firms already show you on their public Hansala proof. Claim your profile so the network points to you."
          : "Claim your company profile so the next confirmation lands on a page you own."}
      </p>

      {count > 0 ? (
        <ul className="mt-5 flex flex-wrap gap-3">
          {listings.map((c) => (
            <li key={c.id}>
              <Link
                href={`/c/${c.slug}`}
                className="inline-flex rounded-xl border border-line bg-paper/50 px-2.5 py-2 transition-colors hover:border-ink/20"
              >
                <LogoTile
                  name={c.name}
                  initials={c.logoInitials}
                  logoUrl={c.logoUrl}
                  website={c.website}
                  showName
                  size="sm"
                />
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-6">
        {existingProfile ? (
          <Button href={`/c/${existingProfile.slug}`} className="h-11 w-full sm:w-auto sm:px-6">
            Open {existingProfile.name} on Hansala
          </Button>
        ) : (
          <form action={seedOnboardingFromConfirm}>
            <input type="hidden" name="name" value={suggestedName} />
            <input type="hidden" name="website" value={suggestedWebsite} />
            <Button type="submit" className="h-11 w-full sm:w-auto sm:px-6">
              Create your company profile
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
