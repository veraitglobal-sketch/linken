import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
  requesterName: string;
  testimonialUrl: string | null;
};

/** Optional client-written testimonial after confirmation. */
export function PostConfirmTestimonial({ requesterName, testimonialUrl }: Props) {
  if (!testimonialUrl) return null;

  return (
    <div className="rounded-[24px] border border-line bg-surface px-5 py-7 sm:px-7">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
        Optional
      </p>
      <h3 className="mt-2 font-display text-xl font-medium tracking-[-0.03em] text-ink">
        Share your experience in your own words
      </h3>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
        {requesterName} can show a short testimonial on their Hansala profile — only
        if you write and publish it yourself. You can edit or withdraw it anytime.
      </p>
      <div className="mt-5">
        <Button href={testimonialUrl} className="h-11 w-full sm:w-auto sm:px-6">
          Write a testimonial
        </Button>
        <p className="mt-3 text-[12px] text-muted">
          Or{" "}
          <Link href={testimonialUrl} className="font-semibold text-ink underline">
            open the link later
          </Link>
        </p>
      </div>
    </div>
  );
}
