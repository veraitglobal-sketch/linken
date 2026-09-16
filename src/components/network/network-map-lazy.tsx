"use client";

import dynamic from "next/dynamic";
import { LoadingState } from "@/components/ui/loading-state";
import type { NetworkGraph } from "@/features/network/types";

const NetworkMap = dynamic(
  () =>
    import("@/components/network/network-map").then((m) => m.NetworkMap),
  {
    ssr: false,
    loading: () => (
      <LoadingState
        compact
        label="Loading network…"
        className="h-full min-h-[12rem] bg-[#f4f5f3]"
      />
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
