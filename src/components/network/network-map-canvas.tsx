import Link from "next/link";
import { NetworkMapLazy } from "@/components/network/network-map-lazy";
import { getNetworkGraph } from "@/features/network/queries";
import type { NetworkScope } from "@/features/network/types";
import { cn } from "@/lib/cn";

type Props = {
  scope: NetworkScope;
  heightClass?: string;
  emptyHref?: string;
  emptyLabel?: string;
  subtitle?: string;
  fullBleed?: boolean;
  editable?: boolean;
  viewerCompanyId?: string | null;
};

export async function NetworkMapCanvas({
  scope,
  heightClass = "h-[min(68vh,640px)]",
  emptyHref,
  emptyLabel = "Add subsidiary",
  subtitle,
  fullBleed = false,
  editable = false,
  viewerCompanyId,
}: Props) {
  const graph = await getNetworkGraph(scope, { viewerCompanyId });
  const publicHref =
    scope.type === "group"
      ? `/g/${scope.slug}#network-map`
      : `/c/${scope.slug}#network-map`;

  const { summary } = graph;
  const counts = [
    summary.companies ? `${summary.companies} companies` : null,
    summary.subsidiaries ? `${summary.subsidiaries} subsidiaries` : null,
    summary.partners ? `${summary.partners} partners` : null,
  ].filter(Boolean);

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden bg-white",
        fullBleed ? "h-full min-h-0" : "rounded-2xl border border-[#e8eaee]",
      )}
    >
      {!fullBleed ? (
        <div className="flex shrink-0 items-center gap-3 border-b border-[#e8eaee] bg-[#fafbfc] px-3 py-2 sm:px-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-semibold text-ink">
              {subtitle ?? "Network"}
            </p>
            {counts.length > 0 ? (
              <p className="truncate text-[11px] text-[#94a3b8]">
                {counts.join(" · ")}
              </p>
            ) : null}
          </div>
          <Link
            href={publicHref}
            className="inline-flex h-7 items-center rounded-lg border border-[#e2e8f0] bg-white px-2.5 text-[11px] font-semibold text-ink"
          >
            Public map
          </Link>
        </div>
      ) : null}

      {graph.nodes.length === 0 ? (
        <div
          className={cn(
            "relative flex flex-col items-center justify-center gap-5 bg-[#fafbfc] px-6",
            fullBleed ? "min-h-0 flex-1" : heightClass,
          )}
          style={{
            backgroundImage:
              "radial-gradient(circle, #d8dde6 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        >
          <div className="max-w-md text-center">
            <p className="text-[15px] font-semibold text-ink">
              Start your network
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-[#5b6472]">
              Add a subsidiary or set up a group, then drag between firms to
              connect. Delete detaches a link.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={emptyHref ?? "/dashboard/structure"}
              className="flex h-[100px] w-[156px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#c5cad3] bg-white text-center transition-colors hover:border-ink/40"
            >
              <span className="text-xl text-[#5b6472]">+</span>
              <span className="px-3 text-[12px] font-semibold text-ink">
                {emptyLabel}
              </span>
            </Link>
            <span className="self-center text-[12px] text-[#9aa3af]">or</span>
            <Link
              href="/dashboard/group"
              className="flex h-[100px] w-[156px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#c5cad3] bg-white text-center transition-colors hover:border-ink/40"
            >
              <span className="text-[12px] font-semibold text-[#5b6472]">
                Group
              </span>
              <span className="px-3 text-[12px] font-semibold text-ink">
                Set up company group
              </span>
            </Link>
          </div>
        </div>
      ) : (
        <div className={fullBleed ? "relative min-h-0 flex-1" : heightClass}>
          <NetworkMapLazy graph={graph} editable={editable} />
        </div>
      )}
    </div>
  );
}
