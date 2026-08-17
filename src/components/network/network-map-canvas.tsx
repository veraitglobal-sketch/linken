import Link from "next/link";
import { NetworkEmptyState } from "@/components/network/network-empty-state";
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
  pendingInviteCount?: number;
  companySlug?: string;
};

export async function NetworkMapCanvas({
  scope,
  heightClass = "h-[min(68vh,640px)]",
  emptyHref,
  emptyLabel = "Add partners on Company",
  subtitle,
  fullBleed = false,
  editable = false,
  viewerCompanyId,
  pendingInviteCount = 0,
  companySlug,
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
        "relative flex flex-col overflow-hidden bg-surface",
        fullBleed
          ? "h-full min-h-0"
          : "rounded-card border border-line shadow-card",
      )}
    >
      {!fullBleed ? (
        <div className="flex shrink-0 items-center gap-3 border-b border-line/80 px-3.5 py-2.5 sm:px-4">
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-[13px] font-medium tracking-[-0.03em] text-ink">
              {subtitle ?? "Network"}
            </p>
            {counts.length > 0 ? (
              <p className="truncate text-[11px] text-muted">
                {counts.join(" · ")}
              </p>
            ) : null}
          </div>
          <Link
            href={publicHref}
            className="inline-flex h-7 items-center rounded-lg border border-line bg-paper px-2.5 text-[11px] font-semibold text-ink transition-colors hover:bg-surface"
          >
            Public map
          </Link>
        </div>
      ) : null}

      {graph.nodes.length === 0 ? (
        <NetworkEmptyState
          emptyHref={emptyHref}
          emptyLabel={emptyLabel}
          className={fullBleed ? "min-h-0 flex-1" : heightClass}
        />
      ) : (
        <div className={fullBleed ? "relative min-h-0 flex-1" : heightClass}>
          <NetworkMapLazy
            graph={graph}
            editable={editable}
            pendingInviteCount={pendingInviteCount}
            title={subtitle ?? "Network"}
            companySlug={companySlug}
          />
        </div>
      )}
    </div>
  );
}
