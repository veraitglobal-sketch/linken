import { cn } from "@/lib/cn";

type Props = {
  partnerCount: number;
  caseStudyCount: number;
  referenceCount: number;
  city: string;
  category: string;
};

/** Only renders proof cells that exist — no empty “0” theatre. */
export function CompanySignal({
  partnerCount,
  caseStudyCount,
  referenceCount,
  city,
  category,
}: Props) {
  const items = [
    partnerCount > 0
      ? {
          label: "Confirmed partners",
          value: String(partnerCount),
          note: "Mutual yes only",
        }
      : null,
    caseStudyCount > 0
      ? {
          label: "Case studies",
          value: String(caseStudyCount),
          note: "With attribution",
        }
      : null,
    referenceCount > 0
      ? {
          label: "Confirmed clients",
          value: String(referenceCount),
          note: "Service references",
        }
      : null,
    category
      ? {
          label: "Registered as",
          value: category,
          note: city || "—",
        }
      : null,
  ].filter(Boolean) as { label: string; value: string; note: string }[];

  if (items.length === 0) return null;

  return (
    <section className="mx-auto mt-4 max-w-6xl px-4">
      <div
        className={cn(
          "grid overflow-hidden rounded-[28px] border border-line bg-surface",
          items.length === 1 && "grid-cols-1",
          items.length === 2 && "grid-cols-1 sm:grid-cols-2",
          items.length === 3 && "grid-cols-1 sm:grid-cols-3",
          items.length >= 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        )}
      >
        {items.map((item, i) => (
          <div
            key={item.label}
            className={
              i === 0
                ? "px-6 py-6 sm:px-7"
                : "border-t border-line px-6 py-6 sm:border-t-0 sm:border-l sm:px-7"
            }
          >
            <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
              {item.label}
            </p>
            <p className="mt-3 font-display text-[clamp(1.35rem,2.2vw,1.75rem)] font-medium tracking-[-0.035em] text-ink">
              {item.value}
            </p>
            <p className="mt-1.5 text-[13px] text-ink-soft">{item.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
