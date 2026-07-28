export const PLATFORM_STAFF_ROLES = ["support", "admin", "owner"] as const;

export type PlatformStaffRole = (typeof PLATFORM_STAFF_ROLES)[number];

const RANK: Record<PlatformStaffRole, number> = {
  support: 1,
  admin: 2,
  owner: 3,
};

export function roleMeetsMinimum(
  role: PlatformStaffRole,
  minRole: PlatformStaffRole,
): boolean {
  return RANK[role] >= RANK[minRole];
}

export function parsePlatformStaffRole(
  value: string | null | undefined,
): PlatformStaffRole | null {
  if (value === "support" || value === "admin" || value === "owner") {
    return value;
  }
  return null;
}
