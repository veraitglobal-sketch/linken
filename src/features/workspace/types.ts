export type WorkspaceContextType = "company" | "group";

export type WorkspaceRole =
  | "owner"
  | "admin"
  | "member"
  | "operator"
  | "creator";

export type WorkspaceContext = {
  type: WorkspaceContextType;
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  website: string | null;
  initials: string;
  role: WorkspaceRole;
  /** Company created_at / group created_at — for deterministic ordering. */
  createdAt: string;
  /** False for unclaimed branches managed by an operator. */
  claimed?: boolean;
};

export type DashboardCompany = {
  id: string;
  name: string;
  slug: string;
  category: string;
  city: string;
  website: string;
  verified: boolean;
  acceptingClients: boolean;
  plan: import("@/features/plan/entitlements").CompanyPlan;
  radar: boolean;
  receiveIntros: boolean;
  introSuspendedUntil: string | null;
  role: WorkspaceRole;
  claimed: boolean;
  /** Section keys for members; null means full access (owner/admin/operator). */
  permissions: import("@/features/workspace/sections").WorkspaceSection[] | null;
};

export type WorkspaceGroupBrief = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  website: string | null;
};
