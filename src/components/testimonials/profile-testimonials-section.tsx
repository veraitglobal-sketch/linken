import Link from "next/link";
import { ProfileIcons, ProfileSection } from "@/components/company/profile-section";
import { ProfileTestimonialCard } from "@/components/testimonials/profile-testimonial-card";
import type { PublicTestimonial } from "@/features/testimonials/types";
import { DotGrid } from "@/components/marketing/dot-grid";

type Props = {
  testimonials: PublicTestimonial[];
  editable?: boolean;
};

const PROFILE_LIMIT = 12;

export function ProfileTestimonialsSection({
  testimonials,
  editable = false,
}: Props) {
  const visible = testimonials.slice(0, PROFILE_LIMIT);
  if (visible.length === 0 && !editable) return null;

  return (
    <ProfileSection
      id="testimonials"
      icon={ProfileIcons.testimonials}
      title="In their own words"
      description="Written by clients — this company cannot edit the text. Each line states how it was confirmed."
    >
      {visible.length > 0 ? (
        <ul className="relative flex list-none flex-col gap-8 p-0">
          {/* The same ground the marketing wall stands on.
              Using our own widget's look on our own profile is the point: if
              this page does not show what the embed looks like, nobody has a
              reason to paste the embed. */}
          <DotGrid className="-inset-x-6 -inset-y-8" />
          {visible.map((item) => (
            <li key={item.id} className="relative">
              <ProfileTestimonialCard item={item} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-dashed border-ink/15 px-5 py-6 text-[14px] text-ink-soft">
          No published testimonials yet. After a client confirms, they can write
          one — it appears here automatically.
        </p>
      )}

      {editable ? (
        <p className="mt-6 text-[13px] text-muted">
          Layout and embed in{" "}
          <Link
            href="/dashboard/testimonials"
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            Testimonials
          </Link>
          .
        </p>
      ) : null}

      {testimonials.length > PROFILE_LIMIT ? (
        <p className="mt-3 text-[12px] text-muted">
          Showing {PROFILE_LIMIT} of {testimonials.length}.
        </p>
      ) : null}
    </ProfileSection>
  );
}
