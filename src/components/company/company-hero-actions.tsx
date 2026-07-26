import { EmbedSnippetButton } from "@/components/company/embed-snippet-button";
import { InquiryForm } from "@/components/inquiries/inquiry-form";
import { BookCallButton } from "@/components/scheduling/book-call-button";
import { Button } from "@/components/ui/button";

type Props = {
  slug: string;
  name: string;
  website: string;
  websiteLinked?: boolean;
  accepting: boolean;
  showContact: boolean;
  showOnePager: boolean;
  showEmbed: boolean;
  showEditProfile: boolean;
  siteUrl: string;
  bookingUrl?: string | null;
  bookingLabel?: string;
};

export function CompanyHeroActions({
  slug,
  name,
  website,
  websiteLinked,
  accepting,
  showContact,
  showOnePager,
  showEmbed,
  showEditProfile,
  siteUrl,
  bookingUrl = null,
  bookingLabel = "Book a call",
}: Props) {
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
      {bookingUrl ? (
        <BookCallButton companySlug={slug} label={bookingLabel} />
      ) : null}
      {showContact ? (
        <InquiryForm
          companySlug={slug}
          companyName={name}
          fullyBooked={!accepting}
        />
      ) : null}
      {showEditProfile ? (
        <Button
          href={`/c/${slug}/edit`}
          variant="light"
          className="h-11 min-w-[150px] px-5"
        >
          Edit company
        </Button>
      ) : null}
      {showOnePager ? (
        <Button href={`/c/${slug}/one-pager`} variant="onDark" className="h-10 px-4">
          One-pager
        </Button>
      ) : null}
      {showEmbed && siteUrl ? (
        <EmbedSnippetButton companySlug={slug} siteUrl={siteUrl} />
      ) : null}
      {website ? (
        <Button href={website} variant="onDark" className="h-10 px-4">
          Website
          {websiteLinked ? (
            <span className="ml-1 text-[10px] font-semibold tracking-[0.08em] opacity-80 uppercase">
              · Linked
            </span>
          ) : null}
        </Button>
      ) : null}
    </div>
  );
}
