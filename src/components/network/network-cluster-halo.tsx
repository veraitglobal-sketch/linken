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
        className="h-full w-full rounded-[36px]"
        style={{
          background:
            "radial-gradient(ellipse 68% 62% at 50% 48%, rgba(126,184,164,0.09), transparent 74%)",
          boxShadow: "inset 0 0 0 1px rgba(14,31,28,0.04)",
        }}
      />
    </div>
  );
}

export const NetworkClusterHalo = memo(NetworkClusterHaloInner);
