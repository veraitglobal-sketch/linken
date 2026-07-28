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
    <section id="testimonials" className="scroll-mt-24 py-2">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-blue uppercase">
        Testimonials
      </p>
      <h2 className="mt-2 font-display text-[clamp(1.5rem,2.5vw,1.95rem)] font-medium tracking-[-0.04em] text-ink">
        In their own words
      </h2>
      <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-ink-soft">
        Written by clients — this company cannot edit the text. Each line states
        how it was confirmed.
      </p>

      {visible.length > 0 ? (
        <ul className="mt-8 flex flex-col gap-8">
          {visible.map((item) => (
            <li key={item.id}>
              <ProfileTestimonialCard item={item} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 border border-dashed border-line px-4 py-6 text-[14px] text-ink-soft">
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
    </section>
  );
}
