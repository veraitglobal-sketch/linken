import "server-only";

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { isPlatformAdminEmail } from "@/features/admin/config";
import {
  parsePlatformStaffRole,
  roleMeetsMinimum,
  type PlatformStaffRole,
} from "@/features/admin/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type PlatformStaffSession = {
  user: User;
  role: PlatformStaffRole;
  email: string;
};

/**
 * Dual gate: PLATFORM_ADMIN_EMAILS (outer) AND platform_staff row (inner).
 * Defaults to highest role requirement when callers omit minRole.
 */
export async function requirePlatformStaff(
  minRole: PlatformStaffRole = "owner",
  loginNext = "/admin",
): Promise<PlatformStaffSession> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(loginNext)}`);
  }

  const email = user.email?.trim() ?? "";
  if (!isPlatformAdminEmail(email)) {
    redirect("/admin-access-denied");
  }

  const admin = createAdminClient();
  if (!admin) {
    redirect("/admin-access-denied");
  }

  const { data: staff } = await admin
    .from("platform_staff")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  const role = parsePlatformStaffRole(staff?.role as string | undefined);
  if (!role || !roleMeetsMinimum(role, minRole)) {
    redirect("/admin-access-denied");
  }

  return { user, role, email };
}

/** @deprecated Prefer requirePlatformStaff — kept for gradual call-site migration. */
export async function requirePlatformAdmin(loginNext = "/admin") {
  const session = await requirePlatformStaff("support", loginNext);
  return { user: session.user, supabase: await createClient() };
}
