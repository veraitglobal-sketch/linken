"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  lookupAddWorkspace,
  resolveClaimTokenForSession,
} from "@/features/workspace/add-workspace-lookup";
import { setWorkspacePreference } from "@/features/workspace/set-preference";
import { createClient } from "@/lib/supabase/server";

export type LookupState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | {
      status: "claim";
      companyId: string;
      companyName: string;
      companySlug: string;
      email: string;
    }
  | {
      status: "owned";
      companyName: string;
      companySlug: string;
      email: string;
    }
  | { status: "missing"; email: string };

export async function lookupWorkspaceForAdd(
  _prev: LookupState,
  formData: FormData,
): Promise<LookupState> {
  const email = String(formData.get("email") ?? "").trim();
  const result = await lookupAddWorkspace(email);
  if (result.kind === "error") {
    return { status: "error", message: result.error };
  }
  if (result.kind === "claim") {
    return {
      status: "claim",
      companyId: result.companyId,
      companyName: result.companyName,
      companySlug: result.companySlug,
      email: result.inviteEmail,
    };
  }
  if (result.kind === "owned") {
    return {
      status: "owned",
      companyName: result.companyName,
      companySlug: result.companySlug,
      email: result.email,
    };
  }
  return { status: "missing", email: result.email };
}

/** Claim without exposing claim_token to the browser. */
export async function claimWorkspaceFromLookup(formData: FormData) {
  const companyId = String(formData.get("company_id") ?? "").trim();
  if (!companyId) {
    redirect("/dashboard/workspaces/new?error=Missing%20company");
  }

  const resolved = await resolveClaimTokenForSession(companyId);
  if (!resolved.ok) {
    redirect(
      `/dashboard/workspaces/new?error=${encodeURIComponent(resolved.error)}`,
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/dashboard/workspaces/new")}`);
  }

  const { data, error } = await supabase.rpc("claim_company", {
    p_token: resolved.token,
  });

  if (error || !data) {
    redirect(
      `/dashboard/workspaces/new?error=${encodeURIComponent(error?.message ?? "Claim failed")}`,
    );
  }

  const row = Array.isArray(data) ? data[0] : data;
  const id = (row as { id?: string })?.id;
  if (id) await setWorkspacePreference("company", id);

  revalidatePath("/dashboard", "layout");
  redirect("/welcome?from=claim");
}
