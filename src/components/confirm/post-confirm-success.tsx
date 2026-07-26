import Link from "next/link";
import { LogoTile } from "@/components/ui/logo-tile";
import { Button } from "@/components/ui/button";
import { PostConfirmLogoFix } from "@/components/confirm/post-confirm-logo-fix";
import { seedOnboardingFromConfirm } from "@/features/acquisition/actions";
import type { ListingCompany } from "@/features/acquisition/listing-companies";
import type { PostConfirmSubject } from "@/features/confirm/post-confirm-subject";

type Props = {
  subject: PostConfirmSubject;
  listings: ListingCompany[];
  suggestedName: string;
  suggestedWebsite: string;
};

/**
 * Post-confirm screen — ~10 seconds of attention, no account required for logo fix.
 * One next step only (listings → claim, or claim/create).
 */
export function PostConfirmSuccess({
  subject,
  listings,
  suggestedName,
  suggestedWebsite,
}: Props) {
  const count = listings.length;
  const relation =
    subject.kind === "case" ? "project" : "service relationship";

  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-line bg-surface px-5 py-7 sm:px-7">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
          Confirmed
        </p>
        <h2 className="mt-2 font-display text-[clamp(1.45rem,3vw,1.85rem)] font-medium tracking-[-0.035em] text-ink">
          You confirmed the {relation} with {subject.requesterName}.
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
          Your mark can appear on {subject.requesterName}&apos;s website, and
          visitors can see the confirmation from your side too.{" "}
          <Link
            href={subject.visibilityHref}
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            View {subject.visibilityLabel} →
          </Link>
        </p>

        <div className="mt-5">
          <PostConfirmLogoFix
            kind={subject.kind}
            token={subject.token}
            name={subject.companyName}
            initials={subject.logoInitials}
            logoUrl={subject.logoUrl}
            website={subject.website}
            domain={subject.domain}
          />
        </div>
      </div>

      <div className="rounded-[24px] border border-line bg-surface px-5 py-7 sm:px-7">
        {count > 0 ? (
          <>
            <h3 className="font-display text-xl font-medium tracking-[-0.03em] text-ink">
              {count === 1
                ? "1 other company has listed you"
                : `${count} other companies have listed you`}
            </h3>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
              Claim your profile so the network points to a page you own.
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
        ) : (
          <>
            <h3 className="font-display text-xl font-medium tracking-[-0.03em] text-ink">
              Claim your company profile
            </h3>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
              Keep your mark and confirmations under a profile you control.
            </p>
          </>
        )}

        <div className="mt-6">
          {subject.claimToken ? (
            <Button
              href={`/claim/${subject.claimToken}`}
              className="h-11 w-full sm:w-auto sm:px-6"
            >
              Claim your profile
            </Button>
          ) : subject.claimed && subject.companySlug ? (
            <Button
              href={`/c/${subject.companySlug}`}
              className="h-11 w-full sm:w-auto sm:px-6"
            >
              Open your profile on Hansala
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
    </div>
  );
}
