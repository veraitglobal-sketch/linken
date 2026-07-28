import "server-only";

import { redirect } from "next/navigation";
import { isPlatformAdminEmail } from "@/features/admin/config";
import { createClient } from "@/lib/supabase/server";

export async function requirePlatformAdmin(loginNext = "/admin") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(loginNext)}`);
  }

  if (!isPlatformAdminEmail(user.email)) {
    redirect("/?error=admin");
  }

  return { user, supabase };
}
