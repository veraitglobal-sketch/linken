"use client";

import dynamic from "next/dynamic";
import type { NetworkGraph } from "@/features/network/types";

const NetworkMap = dynamic(
  () =>
    import("@/components/network/network-map").then((m) => m.NetworkMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-[#f4f5f3] text-[13px] text-muted">
        Loading network…
      </div>
    ),
  },
);

type Props = {
  graph: NetworkGraph;
  editable?: boolean;
  pendingInviteCount?: number;
  title?: string;
  companySlug?: string;
};

export function NetworkMapLazy({
  graph,
  editable,
  pendingInviteCount,
  title,
  companySlug,
}: Props) {
  return (
    <NetworkMap
      graph={graph}
      editable={editable}
      pendingInviteCount={pendingInviteCount}
      title={title}
      companySlug={companySlug}
    />
  );
}
