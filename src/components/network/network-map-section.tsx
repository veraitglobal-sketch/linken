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
      className="mx-auto mt-5 max-w-6xl scroll-mt-28 px-4"
    >
      <div className="overflow-hidden rounded-[22px] border border-line/80 bg-surface shadow-[0_16px_48px_rgba(8,20,18,0.05)]">
        <div className="border-b border-line/70 px-5 py-5 sm:px-7">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-plus uppercase">
            {PRODUCT.map.label}
          </p>
          <h2 className="mt-1.5 font-display text-[clamp(1.4rem,2.2vw,1.75rem)] font-medium tracking-[-0.04em] text-ink">
            {title}
          </h2>
          <p className="mt-2 max-w-[40rem] text-[13px] leading-relaxed text-muted">
            {PRODUCT.map.job}
          </p>
          {graph.summary.companies +
            graph.summary.subsidiaries +
            graph.summary.partners +
            graph.summary.clients >
          0 ? (
            <p className="mt-2 text-[12px] text-muted">
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

        {/* Mobile: compact list */}
        <div className="border-b border-line px-5 py-5 sm:hidden">
          <ul className="space-y-2">
            {graph.nodes.slice(0, 12).map((n) => (
              <li key={n.id}>
                {n.data.href && n.data.href !== "#" ? (
                  <Link
                    href={n.data.href}
                    className="flex items-center justify-between rounded-2xl border border-line px-3 py-2.5 text-[13px]"
                  >
                    <span className="font-medium text-ink">{n.data.name}</span>
                    <span className="text-[11px] tracking-[0.06em] text-muted uppercase">
                      {n.data.kind}
                    </span>
                  </Link>
                ) : (
                  <div className="rounded-2xl border border-line px-3 py-2.5 text-[13px] text-muted">
                    {n.data.name}
                  </div>
                )}
              </li>
            ))}
          </ul>
          <Link
            href={fullMapHref}
            className="mt-3 inline-block text-[13px] font-semibold text-[#1a5c51] underline-offset-2 hover:underline"
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
