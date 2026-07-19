"use client";

import dynamic from "next/dynamic";
import type { NetworkGraph } from "@/features/network/types";

const NetworkMap = dynamic(
  () =>
    import("@/components/network/network-map").then((m) => m.NetworkMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-[#fafbfc] text-[13px] text-[#9aa3af]">
        Loading map…
      </div>
    ),
  },
);

type Props = {
  graph: NetworkGraph;
  editable?: boolean;
};

export function NetworkMapLazy({ graph, editable }: Props) {
  return <NetworkMap graph={graph} editable={editable} />;
}
