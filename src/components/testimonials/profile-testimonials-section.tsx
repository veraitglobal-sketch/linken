import Link from "next/link";
import { ProfileTestimonialCard } from "@/components/testimonials/profile-testimonial-card";
import type { PublicTestimonial } from "@/features/testimonials/types";

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
    <section
      id="testimonials"
      className="scroll-mt-24 rounded-[28px] border border-line bg-surface px-5 py-6 sm:px-7 sm:py-7"
    >
      <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
        Testimonials
      </p>
      <h2 className="mt-2 font-display text-[clamp(1.45rem,2.4vw,1.85rem)] font-medium tracking-[-0.035em] text-ink">
        In their own words
      </h2>
      <p className="mt-2 max-w-xl text-[13px] text-ink-soft">
        Written and published by clients themselves — the company cannot edit this
        text. Each line states how it was confirmed.
      </p>

      {visible.length > 0 ? (
        <ul className="mt-5 flex flex-col gap-3">
          {visible.map((item) => (
            <li key={item.id}>
              <ProfileTestimonialCard item={item} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 rounded-2xl border border-dashed border-line bg-paper/30 px-4 py-5 text-[14px] text-ink-soft">
          No published testimonials yet. After a client confirms a project or
          reference, they can write one from the confirmation page — it appears
          here automatically.
        </p>
      )}

      {editable ? (
        <p className="mt-5 text-[13px] text-muted">
          Choose layout and embed code in{" "}
          <Link
            href="/dashboard/widgets"
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            Widgets
          </Link>
          . Profile section updates when clients publish.
        </p>
      ) : null}

      {testimonials.length > PROFILE_LIMIT ? (
        <p className="mt-3 text-[12px] text-muted">
          Showing {PROFILE_LIMIT} of {testimonials.length} published testimonials.
        </p>
      ) : null}
    </section>
  );
}
