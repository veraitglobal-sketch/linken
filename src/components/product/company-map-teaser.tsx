import Link from "next/link";
import { ProfileIcons, ProfileSection } from "@/components/company/profile-section";
import { PRODUCT } from "@/lib/product-model";

type Props = { companySlug: string };

/** Empty map — same card as “In their own words”, same column width. */
export function CompanyMapTeaser({ companySlug }: Props) {
  return (
    <ProfileSection
      id="network-map"
      icon={ProfileIcons.partners}
      title="Your connections live here"
      description={`${PRODUCT.map.job} Add partners on this page first.`}
    >
      <p className="rounded-2xl border border-dashed border-ink/15 px-5 py-6 text-[14px] text-ink-soft">
        The map draws itself after a partner confirms.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={`/c/${companySlug}?add=1#partners`}
          className="inline-flex h-10 items-center rounded-full bg-navy px-4 text-[14px] font-semibold text-on-navy transition-colors hover:bg-navy-deep"
        >
          Add partner
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex h-10 items-center rounded-full px-4 text-[14px] font-semibold text-ink ring-1 ring-line transition-colors hover:bg-wash"
        >
          Open {PRODUCT.map.label}
        </Link>
      </div>
    </ProfileSection>
  );
}
