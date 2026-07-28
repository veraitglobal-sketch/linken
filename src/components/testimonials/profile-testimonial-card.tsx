import Link from "next/link";
import type { PublicTestimonial } from "@/features/testimonials/types";

type Props = { item: PublicTestimonial };

/** Profile surface — same editorial language as the embed card. */
export function ProfileTestimonialCard({ item }: Props) {
  const published = new Date(item.publishedAt).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });

  return (
    <figure className="border-t border-line pt-6 first:border-t-0 first:pt-0">
      <span
        aria-hidden
        className="block font-display text-[2.5rem] leading-none text-blue-soft/80"
      >
        “
      </span>
      <blockquote className="mt-1 font-display text-[clamp(1.1rem,2.2vw,1.35rem)] font-medium leading-[1.35] tracking-[-0.035em] text-ink">
        {item.body}
      </blockquote>
      <figcaption className="mt-5 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold tracking-[-0.01em] text-ink">
            {item.authorName}
          </p>
          {(item.authorRole || item.authorCompany?.name) && (
            <p className="mt-0.5 text-[13px] text-ink-soft">
              {[item.authorRole, item.authorCompany?.name]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
          <p className="mt-2 text-[12px] leading-relaxed text-muted">
            {item.provenanceLine}
            <span className="mx-1.5 opacity-40">·</span>
            <time dateTime={item.publishedAt}>{published}</time>
          </p>
          {item.authorCompany ? (
            <p className="mt-2">
              <Link
                href={`/c/${item.authorCompany.slug}`}
                className="text-[12px] font-semibold text-blue underline-offset-2 hover:underline"
              >
                View {item.authorCompany.name}
              </Link>
            </p>
          ) : null}
        </div>
        <p className="shrink-0 text-[10px] font-bold tracking-[0.14em] text-blue uppercase">
          Hansala
        </p>
      </figcaption>
    </figure>
  );
}
