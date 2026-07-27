import type { PublicTestimonial } from "@/features/testimonials/types";
import { cn } from "@/lib/cn";

type Props = {
  item: PublicTestimonial;
  profileUrl: string;
  compact?: boolean;
  featured?: boolean;
};

export function EmbedTestimonialCard({
  item,
  profileUrl,
  compact = false,
  featured = false,
}: Props) {
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
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "hs-tm-card block w-full no-underline transition-[transform,box-shadow] duration-150",
        compact ? "px-1 py-2" : "border p-[var(--hs-tm-spacing)]",
      )}
      style={{
        background: compact ? "transparent" : "var(--hs-tm-card-bg)",
        borderColor: compact ? "transparent" : "var(--hs-tm-border)",
        borderWidth: compact ? 0 : "var(--hs-tm-border-w)",
        borderRadius: compact ? 0 : "var(--hs-tm-radius)",
        boxShadow: compact ? "none" : "var(--hs-tm-shadow)",
        color: "var(--hs-tm-text)",
      }}
    >
      <blockquote
        className={cn(
          "leading-snug tracking-[-0.02em]",
          featured ? "text-[1.05em] font-medium" : compact ? "text-[0.92em]" : "text-[1em]",
        )}
        style={{ color: "var(--hs-tm-text)" }}
      >
        &ldquo;{item.body}&rdquo;
      </blockquote>
      <p
        className={cn("hs-tm-attribution mt-2", compact ? "text-[0.85em]" : "text-[0.9em]")}
        style={{ color: "var(--hs-tm-muted)" }}
      >
        — {authorLine}
        <span className="mx-1 opacity-40">·</span>
        <time dateTime={item.publishedAt}>{published}</time>
      </p>
      {!compact ? (
        <p
          className="hs-tm-attribution mt-2 text-[0.72em] tracking-[0.1em] uppercase"
          style={{ color: "var(--hs-tm-accent)" }}
        >
          Verified client testimonial on Hansala
        </p>
      ) : null}
    </a>
  );
}
