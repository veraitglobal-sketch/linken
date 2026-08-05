"use client";

import { memo } from "react";
import type { NodeProps } from "@xyflow/react";

export type ClusterHaloData = {
  width: number;
  height: number;
};

function NetworkClusterHaloInner({ data }: NodeProps) {
  const d = data as ClusterHaloData;
  return (
    <div
      aria-hidden
      className="pointer-events-none"
      style={{ width: d.width, height: d.height }}
    >
      <div
        className="h-full w-full rounded-[32px] border border-dashed border-line/70 bg-white/30"
        style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)" }}
      />
    </div>
  );
}

export const NetworkClusterHalo = memo(NetworkClusterHaloInner);
