import Link from "next/link";
import { NetworkMapLazy } from "@/components/network/network-map-lazy";
import { getNetworkGraph } from "@/features/network/queries";
import type { NetworkScope } from "@/features/network/types";
import { PRODUCT } from "@/lib/product-model";

type Props = {
  scope: NetworkScope;
  title: string;
  minHeightClass?: string;
};

export async function NetworkMapSection({
  scope,
  title,
  minHeightClass = "h-[70vh]",
}: Props) {
  const graph = await getNetworkGraph(scope);
  if (graph.nodes.length === 0) return null;

  const fullMapHref =
    scope.type === "group"
      ? `/g/${scope.slug}#network-map`
      : `/c/${scope.slug}#network-map`;

  return (
    <section
      id="network-map"
      className="mx-auto mt-4 max-w-[calc(1280px+2.25rem)] scroll-mt-28 px-4 sm:px-[18px]"
    >
      <div className="overflow-hidden rounded-[24px] bg-surface ring-1 ring-line/70">
        <div className="flex items-start gap-3 border-b border-line/70 px-5 py-5 sm:px-7">
          <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-lime-soft text-navy">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="3.5" cy="4" r="1.8" />
              <circle cx="12.5" cy="5" r="1.8" />
              <circle cx="8" cy="12" r="1.8" />
              <path d="M5.2 4.4 10.7 4.8M4.4 5.6l2.7 4.8M11.7 6.6 9 10.4" />
            </svg>
          </span>
          <div className="min-w-0">
          <h2 className="font-display text-[20px] leading-tight font-semibold tracking-[-0.03em] text-ink">
            {title}
          </h2>
          <p className="mt-1 max-w-[40rem] text-[14px] leading-relaxed text-muted">
            {PRODUCT.map.job}
          </p>
          {graph.summary.companies +
            graph.summary.subsidiaries +
            graph.summary.partners +
            graph.summary.clients >
          0 ? (
            <p className="mt-1.5 text-[12.5px] text-muted">
              {[
                graph.summary.companies
                  ? `${graph.summary.companies} companies`
                  : null,
                graph.summary.subsidiaries
                  ? `${graph.summary.subsidiaries} subsidiaries`
                  : null,
                graph.summary.partners
                  ? `${graph.summary.partners} partners`
                  : null,
                graph.summary.clients
                  ? `${graph.summary.clients} clients`
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          ) : null}
          </div>
        </div>

        {/* Mobile: compact list */}
        <div className="border-b border-line px-5 py-5 sm:hidden">
          <ul className="space-y-2">
            {graph.nodes.slice(0, 12).map((n) => (
              <li key={n.id}>
                {n.data.href && n.data.href !== "#" ? (
                  <Link
                    href={n.data.href}
                    className="flex items-center justify-between rounded-tile border border-line px-3 py-2.5 text-[13px]"
                  >
                    <span className="font-medium text-ink">{n.data.name}</span>
                    <span className="text-[11px] tracking-[0.06em] text-muted uppercase">
                      {n.data.kind}
                    </span>
                  </Link>
                ) : (
                  <div className="rounded-tile border border-line px-3 py-2.5 text-[13px] text-muted">
                    {n.data.name}
                  </div>
                )}
              </li>
            ))}
          </ul>
          <Link
            href={fullMapHref}
            className="mt-3 inline-block text-[13px] font-semibold text-blue underline-offset-2 hover:underline"
          >
            Open full map
          </Link>
        </div>

        {/* Desktop / tablet canvas */}
        <div className={`hidden sm:block ${minHeightClass}`}>
          <NetworkMapLazy graph={graph} />
        </div>
      </div>
    </section>
  );
}
