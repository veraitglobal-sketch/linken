import type { TrustLevel } from "@/features/trust/score";

export type NetworkNodeKind = "group" | "company" | "external";

export type NetworkEdgeType = "member_of" | "partner" | "client";

export type NetworkNodeData = {
  slug: string;
  name: string;
  logoInitials: string;
  category: string;
  city: string;
  trustLevel: TrustLevel | null;
  kind: NetworkNodeKind;
  stats: {
    confirmedPartners: number;
    confirmedReferences: number;
    companyCount?: number;
    countryCount?: number;
  };
  href: string;
  /** Overflow marker */
  moreCount?: number;
};

export type NetworkNode = {
  id: string;
  data: NetworkNodeData;
};

export type NetworkEdge = {
  id: string;
  source: string;
  target: string;
  type: NetworkEdgeType;
};

export type NetworkGraph = {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
};

export type NetworkScope =
  | { type: "group"; slug: string }
  | { type: "company"; slug: string };
