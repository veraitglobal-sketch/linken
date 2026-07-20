import type { Node } from "@xyflow/react";
import type { NetworkCluster } from "@/features/network/layout-types";
import type { ClusterHaloData } from "@/components/network/network-cluster-halo";

export function toHaloNodes(clusters: NetworkCluster[]): Node[] {
  return clusters.map((c) => ({
    id: `cluster:${c.ownerId}`,
    type: "clusterHalo",
    position: { x: c.cx - c.rx, y: c.cy - c.ry },
    data: {
      width: c.rx * 2,
      height: c.ry * 2,
    } satisfies ClusterHaloData,
    draggable: false,
    selectable: false,
    focusable: false,
    connectable: false,
    deletable: false,
    zIndex: -1,
  }));
}

export function isClusterNodeId(id: string) {
  return id.startsWith("cluster:");
}
