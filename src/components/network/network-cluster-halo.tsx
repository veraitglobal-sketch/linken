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
        className="h-full w-full rounded-full border border-dashed opacity-70"
        style={{
          borderColor: "var(--line)",
          background: "var(--accent-soft)",
        }}
      />
    </div>
  );
}

export const NetworkClusterHalo = memo(NetworkClusterHaloInner);
