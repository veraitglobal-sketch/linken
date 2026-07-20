"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { classifyLogoFetchFailure } from "@/features/logo/classify-failure";
import { fetchAndStoreGroupLogo } from "@/features/logo/fetch-group-logo";
import { scheduleGroupLogoFetch } from "@/features/logo/schedule";
import { createClient } from "@/lib/supabase/server";

function safeBack(formData: FormData, fallback = "/dashboard/group") {
  const raw = String(formData.get("back") ?? "").trim();
  return raw.startsWith("/dashboard") ? raw : fallback;
}

function dash(back: string, query: string) {
  const hashIdx = back.indexOf("#");
  const path = (hashIdx >= 0 ? back.slice(0, hashIdx) : back) || "/dashboard";
  const hash = hashIdx >= 0 ? back.slice(hashIdx) : "";
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}${query}${hash}`;
}

async function requireGroupCreator(groupId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, group: null };

  const { data: group } = await supabase
    .from("company_groups")
    .select("id, slug, website, logo_source, created_by")
    .eq("id", groupId)
    .maybeSingle();

  if (!group || group.created_by !== user.id) {
    return { supabase, user, group: null };
  }
  return { supabase, user, group };
}

/** Save group website; schedules logo fetch when auto mode allows. */
export async function updateGroupWebsite(formData: FormData) {
  const groupId = String(formData.get("group_id") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const back = safeBack(formData);

  const { group } = await requireGroupCreator(groupId);
  if (!group) {
    redirect(`${back}?error=${encodeURIComponent("Not allowed.")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("company_groups")
    .update({ website })
    .eq("id", group.id);

  if (error) {
    redirect(`${back}?error=${encodeURIComponent(error.message)}`);
  }

  if (website && group.logo_source !== "manual") {
    scheduleGroupLogoFetch(group.id);
  }

  revalidatePath(back);
  revalidatePath("/dashboard/group");
  revalidatePath(`/g/${group.slug}`);
  redirect(dash(back, "ok=group-website"));
}

export async function refreshGroupLogo(formData: FormData) {
  const groupId = String(formData.get("group_id") ?? "").trim();
  const back = safeBack(formData);

  const { supabase, group } = await requireGroupCreator(groupId);
  if (!group) {
    redirect(`${back}?error=${encodeURIComponent("Not allowed.")}`);
  }

  if (group.logo_source === "manual") {
    redirect(
      dash(
        back,
        `error=${encodeURIComponent("Uploaded logos are not replaced automatically.")}`,
      ),
    );
  }
  if (!group.website) {
    redirect(
      dash(back, `error=${encodeURIComponent("Add a group website first.")}`),
    );
  }

  const { data: allowed, error: rateError } = await supabase.rpc(
    "record_group_logo_refresh_attempt",
    { p_group_id: group.id },
  );
  if (rateError) {
    redirect(dash(back, `error=${encodeURIComponent(rateError.message)}`));
  }
  if (allowed === false) {
    redirect(
      dash(
        back,
        `error=${encodeURIComponent("Rate limit: max 3 logo refreshes per day.")}`,
      ),
    );
  }

  const result = await fetchAndStoreGroupLogo(group.id);
  if (!result.ok) {
    if (!result.skipped) {
      console.error(
        "[logo-fetch] group",
        group.id,
        classifyLogoFetchFailure(result.error),
        result.error,
      );
    }
    redirect(dash(back, `error=${encodeURIComponent(result.error)}`));
  }

  revalidatePath(back);
  revalidatePath("/dashboard/group");
  revalidatePath(`/g/${group.slug}`);
  redirect(dash(back, "ok=group-logo"));
}
