"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOperatorActiveCompany } from "@/features/workspace/require-operator";

/** Toggle invite reminder outreach — explicit operator control. */
export async function updateOutreachPreferences(formData: FormData) {
  const { supabase, company } = await requireOperatorActiveCompany({
    loginNext: "/dashboard/settings",
  });
  const enabled = String(formData.get("invite_reminders") ?? "") === "1";

  const { error } = await supabase
    .from("companies")
    .update({ invite_reminders_enabled: enabled })
    .eq("id", company.id);

  const back = `/c/${company.slug}/edit`;
  if (error) {
    redirect(`${back}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(back);
  revalidatePath("/dashboard/partners");
  redirect(`${back}?saved=1`);
}
