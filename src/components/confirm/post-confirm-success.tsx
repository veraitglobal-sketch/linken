import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PostConfirmLogoFix } from "@/components/confirm/post-confirm-logo-fix";
import { PostConfirmListings } from "@/components/confirm/post-confirm-listings";
import { seedOnboardingFromConfirm } from "@/features/acquisition/actions";
import type { ListingCompany } from "@/features/acquisition/listing-companies";
import type { PostConfirmSubject } from "@/features/confirm/post-confirm-subject";
import {
  POST_CONFIRM_BENEFIT,
  POST_CONFIRM_BENEFIT_REFERENCE,
} from "@/features/growth/copy";

type Props = {
  subject: PostConfirmSubject;
  listings: ListingCompany[];
  suggestedName: string;
  suggestedWebsite: string;
};

/**
 * Post-confirm success — optional next step only.
 * No auto-create, no auto-invite, no dark patterns.
 */
export function PostConfirmSuccess({
  subject,
  listings,
  suggestedName,
  suggestedWebsite,
}: Props) {
  const benefit =
    subject.kind === "case"
      ? POST_CONFIRM_BENEFIT
      : POST_CONFIRM_BENEFIT_REFERENCE;

  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-line bg-surface px-5 py-7 sm:px-7">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
          Confirmed
        </p>
        <h2 className="mt-2 font-display text-[clamp(1.45rem,3vw,1.85rem)] font-medium tracking-[-0.035em] text-ink">
          Confirmation recorded
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">{benefit}</p>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
          Visitors can see this confirmation on{" "}
          <Link
            href={subject.visibilityHref}
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            {subject.visibilityLabel}
          </Link>
          . After you claim or create a profile, the same verified work can appear
          on your side too — only confirmed records, never pending ones.
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
        <PostConfirmListings listings={listings} />
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
              <input
                type="hidden"
                name="referrer_slug"
                value={subject.requesterSlug}
              />
              <Button type="submit" className="h-11 w-full sm:w-auto sm:px-6">
                Create your free profile
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
