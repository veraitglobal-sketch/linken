import dynamic from "next/dynamic";
import Link from "next/link";
import { getNetworkGraph } from "@/features/network/queries";
import type { NetworkScope } from "@/features/network/types";

const NetworkMap = dynamic(
  () =>
    import("@/components/network/network-map").then((m) => m.NetworkMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-[#0a1714] text-[13px] text-white/45">
        Loading map…
      </div>
    ),
  },
);

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
      <div className="overflow-hidden rounded-[28px] border border-line bg-surface">
        <div className="border-b border-line px-5 py-5 sm:px-7">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
            Structure
          </p>
          <h2 className="mt-2 font-display text-[clamp(1.5rem,2.4vw,1.9rem)] font-medium tracking-[-0.035em] text-ink">
            {title}
          </h2>
          <p className="mt-2 max-w-[42rem] text-[14px] leading-relaxed text-ink-soft">
            Confirmed relationships only — group membership, partners, and
            clients. Evidence is never merged across branches.
          </p>
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
                  <div className="rounded-2xl border border-line px-3 py-2.5 text-[13px] text-ink-soft">
                    {n.data.name}
                  </div>
                )}
              </li>
            ))}
          </ul>
          <Link
            href={fullMapHref}
            className="mt-3 inline-block text-[13px] font-semibold text-[#1f6b5c] underline-offset-2 hover:underline"
          >
            Open full map
          </Link>
        </div>

        {/* Desktop / tablet canvas */}
        <div className={`hidden sm:block ${minHeightClass}`}>
          <NetworkMap graph={graph} />
        </div>
      </div>
    </section>
  );
}
