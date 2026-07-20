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
        className="h-full w-full rounded-full border border-dashed"
        style={{
          borderColor: "rgba(26, 92, 81, 0.28)",
          background:
            "radial-gradient(circle at 50% 45%, rgba(126, 184, 164, 0.16), rgba(14, 31, 28, 0.03) 70%)",
        }}
      />
    </div>
  );
}

export const NetworkClusterHalo = memo(NetworkClusterHaloInner);
