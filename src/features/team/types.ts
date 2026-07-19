export type TeamRole = "owner" | "admin" | "member";

export type TeamMember = {
  userId: string;
  role: TeamRole;
  displayName: string;
  displayTitle: string;
  photoUrl: string | null;
  publicVisible: boolean;
  createdAt: string;
};

export type TeamInvitation = {
  id: string;
  inviteName: string;
  inviteTitle: string;
  inviteEmail: string;
  role: "admin" | "member";
  status: "pending" | "accepted" | "declined" | "cancelled";
  createdAt: string;
};

export type TeamInvitePreview = {
  invitationId: string;
  companyId: string;
  companyName: string;
  companySlug: string;
  inviteName: string;
  inviteTitle: string;
  inviteEmail: string;
  role: "admin" | "member";
  status: string;
  inviterHint: string;
};

export type PublicTeamMember = {
  displayName: string;
  displayTitle: string;
  photoUrl: string | null;
};

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}
