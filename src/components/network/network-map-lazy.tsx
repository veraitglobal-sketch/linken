"use client";

import dynamic from "next/dynamic";
import type { NetworkGraph } from "@/features/network/types";

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
  graph: NetworkGraph;
};

/** Client wrapper — Next.js disallows ssr:false dynamic() in Server Components. */
export function NetworkMapLazy({ graph }: Props) {
  return <NetworkMap graph={graph} />;
}
