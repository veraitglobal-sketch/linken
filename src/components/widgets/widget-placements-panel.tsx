import { PLACEMENT_STALE_DAYS } from "@/features/widgets/placement-queries";
import type { WidgetPlacementsSummary } from "@/features/widgets/placement-queries";
import { cn } from "@/lib/cn";

function formatSeen(iso: string) {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "—";
  return new Date(t).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Free for all plans — security signal (foreign embeds) + live hosts. */
export function WidgetPlacementsPanel({
  placements,
}: {
  placements: WidgetPlacementsSummary;
}) {
  const { hosts, foreignCount, staleCount } = placements;

  return (
    <section className="rounded-[22px] border border-line/70 bg-surface px-5 py-5 shadow-[0_14px_40px_rgba(8,20,18,0.045)] sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
            Where your badge renders
          </p>
          <h2 className="mt-1 font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
            Active placements
          </h2>
        </div>
        <p className="text-[12px] text-plus">
          {hosts.length === 0
            ? "No domains yet"
            : `${hosts.length} domain${hosts.length === 1 ? "" : "s"}`}
        </p>
      </header>

      {foreignCount > 0 ? (
        <p className="mt-4 rounded-2xl border border-ember/30 bg-ember/10 px-4 py-3 text-[13px] text-ink">
          {foreignCount} unauthorised host{foreignCount === 1 ? "" : "s"} detected.
          CSP blocks framing there — review the list below.
        </p>
      ) : null}

      {staleCount > 0 ? (
        <p
          className={`rounded-2xl border border-line bg-[#f7f8fa] px-4 py-3 text-[13px] text-ink-soft ${
            foreignCount > 0 ? "mt-2" : "mt-4"
          }`}
        >
          {staleCount} host{staleCount === 1 ? "" : "s"} silent for{" "}
          {PLACEMENT_STALE_DAYS}+ days — badge may have been removed.
        </p>
      ) : null}

      {hosts.length === 0 ? (
        <p className="mt-4 text-[14px] text-ink-soft">
          After you embed on your site, domains appear here with last-seen dates.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-line/70 border-t border-line/70">
          {hosts.map((h) => (
            <li
              key={h.host}
              className="flex flex-wrap items-baseline justify-between gap-2 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-[14px] font-medium text-ink">
                  {h.host}
                </p>
                <p className="mt-0.5 text-[12px] text-muted">
                  Last seen {formatSeen(h.lastSeenAt)}
                  {h.variants.length
                    ? ` · ${h.variants.slice(0, 3).join(", ")}`
                    : null}
                  {h.stale ? " · stale" : null}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-[0.06em] uppercase",
                  h.kind === "foreign"
                    ? "border-ember/35 bg-ember/10 text-ink"
                    : "border-[#1a5c51]/25 bg-[#1a5c51]/08 text-ink",
                )}
              >
                {h.kind === "foreign" ? "Unauthorised" : "Owned"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
