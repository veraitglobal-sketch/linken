import type { PublicTestimonial } from "@/features/testimonials/types";
import { cn } from "@/lib/cn";

type Props = {
  item: PublicTestimonial;
  profileUrl: string;
  compact?: boolean;
  featured?: boolean;
};

/** Editorial proof card — quiet enough for any host, precise enough for Hansala. */
export function EmbedTestimonialCard({
  item,
  profileUrl,
  compact = false,
  featured = false,
}: Props) {
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
        "hs-tm-card group block w-full no-underline",
        compact ? "px-0 py-3" : "p-[var(--hs-tm-spacing)]",
        !compact && "border",
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
      {!compact ? (
        <span
          aria-hidden
          className="hs-tm-mark block font-display leading-none select-none"
          style={{
            color: "var(--hs-tm-accent)",
            fontSize: featured ? "2.4em" : "1.85em",
            opacity: 0.55,
            marginBottom: "0.15em",
          }}
        >
          “
        </span>
      ) : null}

      <blockquote
        className={cn(
          "hs-tm-body m-0 font-display font-medium leading-[1.35] tracking-[-0.03em]",
          featured ? "text-[1.12em]" : compact ? "text-[0.95em]" : "text-[1.02em]",
        )}
        style={{ color: "var(--hs-tm-text)" }}
      >
        {item.body}
      </blockquote>

      <footer className={cn("hs-tm-attribution mt-4", compact && "mt-2.5")}>
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p
              className="m-0 text-[0.82em] font-semibold tracking-[-0.01em]"
              style={{ color: "var(--hs-tm-text)" }}
            >
              {item.authorName}
            </p>
            {(item.authorRole || item.authorCompany?.name) && (
              <p
                className="m-0 mt-0.5 truncate text-[0.75em] leading-snug"
                style={{ color: "var(--hs-tm-muted)" }}
              >
                {[item.authorRole, item.authorCompany?.name]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
            {(item.provenanceLine || item.publishedAt) && (
              <p
                className="m-0 mt-1.5 text-[0.7em] leading-relaxed"
                style={{ color: "var(--hs-tm-muted)" }}
              >
                {item.provenanceLine}
                {item.provenanceLine && item.publishedAt ? (
                  <span className="mx-1 opacity-40">·</span>
                ) : null}
                {item.publishedAt ? (
                  <time dateTime={item.publishedAt}>{published}</time>
                ) : null}
              </p>
            )}
          </div>
          <span
            className="hs-tm-seal shrink-0 text-[9px] font-bold tracking-[0.14em] uppercase"
            style={{ color: "var(--hs-tm-accent)" }}
          >
            Hansala
          </span>
        </div>
      </footer>
    </a>
  );
}
