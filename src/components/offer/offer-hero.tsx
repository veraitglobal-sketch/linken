import Link from "next/link";
import { HomeEyebrow } from "@/components/marketing/home-section";

export function OfferHero() {
  return (
    <div>
      <HomeEyebrow>Introductory offer</HomeEyebrow>
      <h1 className="mt-5 max-w-[16ch] font-display text-chapter text-ink text-balance">
        Six months or a year.
      </h1>
      <p className="mt-5 max-w-[42ch] text-[15px] leading-relaxed text-ink-soft">
        Same Pro as monthly — testimonials and partner logos on your site,
        analytics, API, and seats. Checkout is USD.{" "}
        <Link
          href="/pricing"
          className="font-semibold text-ink underline-offset-2 hover:underline"
        >
          Standard pricing
        </Link>{" "}
        is €79 / month.
      </p>
    </div>
  );
}
