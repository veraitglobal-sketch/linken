import type { NetworkNode } from "@/features/network/types";

export type PositionedNode = NetworkNode & {
  position: { x: number; y: number };
};

/** Partner/client cluster bound to one ownership node. */
export type NetworkCluster = {
  ownerId: string;
  nodeIds: string[];
  cx: number;
  cy: number;
  rx: number;
  ry: number;
};

export type LayoutResult = {
  nodes: PositionedNode[];
  clusters: NetworkCluster[];
};
