import "server-only";

import { isPlatformAdminEmail } from "@/features/admin/config";
import { parsePlatformStaffRole } from "@/features/admin/roles";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * True when this Auth user is platform staff (allowlist + platform_staff row).
 * Used for post-login routing and company/staff mutual exclusion.
 */
export async function isPlatformStaffUser(
  userId: string,
  email: string | null | undefined,
): Promise<boolean> {
  if (!isPlatformAdminEmail(email)) return false;
  const admin = createAdminClient();
  if (!admin) return false;
  const { data } = await admin
    .from("platform_staff")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();
  return Boolean(parsePlatformStaffRole(data?.role as string | undefined));
}

/** Staff always go to /admin. Non-staff never stay on /admin. */
export function resolvePostLoginPath(
  isStaff: boolean,
  requestedNext: string,
): string {
  const next =
    requestedNext.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : "/dashboard";
  if (isStaff) return "/admin";
  const path = next.split("?")[0] ?? next;
  if (path === "/admin" || path.startsWith("/admin/")) return "/dashboard";
  return next;
}
