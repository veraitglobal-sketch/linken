import Link from "next/link";
import type { PublicTestimonial } from "@/features/testimonials/types";

type Props = {
  item: PublicTestimonial;
};

export function ProfileTestimonialCard({ item }: Props) {
  const authorLine = [
    item.authorName,
    item.authorRole,
    item.authorCompany?.name,
  ]
    .filter(Boolean)
    .join(" · ");

  const published = new Date(item.publishedAt).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });

  return (
    <figure className="rounded-2xl border border-line bg-paper/40 px-5 py-5 sm:px-6">
      <blockquote className="font-display text-[clamp(1.05rem,2vw,1.2rem)] font-medium leading-snug tracking-[-0.03em] text-ink">
        &ldquo;{item.body}&rdquo;
      </blockquote>
      <figcaption className="mt-4 space-y-1">
        <p className="text-[14px] text-ink-soft">
          — {authorLine}
          <span className="mx-1.5 opacity-40">·</span>
          <time dateTime={item.publishedAt}>{published}</time>
        </p>
        <p className="text-[13px] leading-relaxed text-muted">{item.provenanceLine}</p>
        {item.authorCompany ? (
          <p className="pt-1">
            <Link
              href={`/c/${item.authorCompany.slug}`}
              className="text-[12px] font-semibold text-ink underline-offset-2 hover:underline"
            >
              {item.authorCompany.name}
            </Link>
          </p>
        ) : null}
      </figcaption>
    </figure>
  );
}
