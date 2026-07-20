"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getWorkspaceContexts } from "@/features/workspace/context";
import { setWorkspacePreference } from "@/features/workspace/set-preference";
import type { WorkspaceContextType } from "@/features/workspace/types";
import { createClient } from "@/lib/supabase/server";

/**
 * Preference only. Access is re-checked against membership/creator lists —
 * a forged cookie cannot grant a context the user does not have.
 */
export async function switchWorkspace(formData: FormData) {
  const type = String(formData.get("type") ?? "").trim() as WorkspaceContextType;
  const id = String(formData.get("id") ?? "").trim();
  const backRaw = String(formData.get("back") ?? "/dashboard").trim();
  const back = backRaw.startsWith("/") ? backRaw : "/dashboard";

  if ((type !== "company" && type !== "group") || !id) {
    redirect(back);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);

  const contexts = await getWorkspaceContexts(user.id);
  const allowed = contexts.some((c) => c.type === type && c.id === id);
  if (!allowed) {
    const sep = back.includes("?") ? "&" : "?";
    redirect(
      `${back}${sep}error=${encodeURIComponent("Workspace not available.")}`,
    );
  }

  await setWorkspacePreference(type, id);

  revalidatePath("/dashboard", "layout");
  redirect(type === "group" ? "/dashboard/group" : "/dashboard");
}
