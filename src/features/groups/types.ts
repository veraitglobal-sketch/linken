import type { TrustLevel } from "@/features/trust/score";
import type { GroupMemberNode } from "@/features/groups/tree";

export type CompanyGroup = {
  id: string;
  name: string;
  slug: string;
  description: string;
  website: string;
  createdBy: string;
  createdAt: string;
};

export type GroupMemberCard = {
  companyId: string;
  slug: string;
  name: string;
  category: string;
  city: string;
  country: string;
  logoInitials: string;
  logoUrl?: string | null;
  claimed: boolean;
  trustLevel: TrustLevel;
  confirmedReferences: number;
  parentCompanyId: string | null;
};

export type GroupPublicPage = {
  group: CompanyGroup;
  members: GroupMemberCard[];
  tree: GroupMemberNode[];
  companyCount: number;
  countryCount: number;
};

export type GroupMembershipStatus =
  | "pending"
  | "confirmed"
  | "declined"
  | "ended";

export type PendingGroupInvite = {
  groupId: string;
  groupName: string;
  groupSlug: string;
  companyId: string;
  companyName: string;
  invitedAt: string;
  parentCompanyId: string | null;
};

export type PendingParentProposal = {
  groupId: string;
  groupName: string;
  groupSlug: string;
  companyId: string;
  companyName: string;
  parentCompanyId: string;
  parentName: string;
};

export type DashboardGroup = {
  group: CompanyGroup;
  confirmed: GroupMemberCard[];
  tree: GroupMemberNode[];
  pending: {
    companyId: string;
    slug: string;
    name: string;
    city: string;
    country: string;
    parentCompanyId: string | null;
  }[];
};

export type ConfirmedGroupBadge = {
  name: string;
  slug: string;
};

/** Confirmed membership of the viewer's company (for leave / add subsidiary). */
export type OwnedGroupMembership = {
  groupId: string;
  groupName: string;
  groupSlug: string;
  companyId: string;
  companyName: string;
  companySlug: string;
};
