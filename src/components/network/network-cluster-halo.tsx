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
            "radial-gradient(ellipse 72% 64% at 50% 48%, rgba(126,184,164,0.11), transparent 76%)",
          boxShadow:
            "inset 0 0 0 1px rgba(14,31,28,0.06), inset 0 1px 0 rgba(255,255,255,0.55)",
        }}
      />
    </div>
  );
}

export const NetworkClusterHalo = memo(NetworkClusterHaloInner);
