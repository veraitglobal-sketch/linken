import type { TrustLevel } from "@/features/trust/score";

/** Visual / semantic role of a node on the map. */
export type NetworkNodeKind =
  | "group"
  | "company"
  | "subsidiary"
  | "partner"
  | "client";

export type NetworkEdgeType =
  | "member_of"
  | "subsidiary"
  | "partner"
  | "client";

export type NetworkNodeData = {
  slug: string;
  name: string;
  logoInitials: string;
  logoUrl?: string | null;
  website?: string | null;
  /** auto | manual | null — owner UI for retry when null + website. */
  logoSource?: string | null;
  category: string;
  city: string;
  trustLevel: TrustLevel | null;
  kind: NetworkNodeKind;
  /** Raw company uuid when kind is a company node. */
  companyId?: string;
  /** Domain verification (DNS / meta / email-domain). Required for trust. */
  domainVerified?: boolean;
  stats: {
    confirmedPartners: number;
    confirmedReferences: number;
    companyCount?: number;
    countryCount?: number;
  };
  href: string;
  moreCount?: number;
  /** Public-visible team size (no PII). Omit / 0 → no node indicator. */
  publicTeamCount?: number;
  /** Up to 3 avatars for node stack — photo or initials only, never names. */
  publicTeamAvatars?: { photoUrl: string | null; initials: string }[];
};

export type NetworkNode = {
  id: string;
  data: NetworkNodeData;
};

export type NetworkEdgeMeta = {
  partnershipId?: string;
  groupId?: string;
  /** Company removed when ending a group / subsidiary link. */
  memberCompanyId?: string;
  label?: string;
};

export type NetworkEdge = {
  id: string;
  source: string;
  target: string;
  type: NetworkEdgeType;
  detachable?: boolean;
  meta?: NetworkEdgeMeta;
};

export type NetworkGraphSummary = {
  companies: number;
  subsidiaries: number;
  partners: number;
  clients: number;
};

export type NetworkGraphContext = {
  groupId?: string | null;
  groupSlug?: string | null;
  viewerCompanyId?: string | null;
  /** Group creator user id (for owner logo controls). */
  groupCreatedBy?: string | null;
  /** True when the signed-in user created the scoped group. */
  isGroupCreator?: boolean;
};

export type NetworkGraph = {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  summary: NetworkGraphSummary;
  context?: NetworkGraphContext;
};

/**
 * - group: full group tree + every member’s partners & clients
 * - company local: focus firm + its subsidiaries + its partners & clients
 * - company full: if in a group → entire group network; else same as local
 */
export type NetworkScope =
  | { type: "group"; slug: string }
  | { type: "company"; slug: string; expand?: "local" | "full" };
