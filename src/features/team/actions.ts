"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendTeamJoinInviteEmail } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";

function safeBack(raw: string, fallback = "/dashboard/team") {
  const back = raw.trim();
  return back.startsWith("/dashboard") || back.startsWith("/join/")
    ? back
    : fallback;
}

/** Merge flash params onto a dashboard back path (keeps existing ?tab=). */
function backWith(back: string, params: Record<string, string>) {
  const url = new URL(back, "http://linken.local");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return `${url.pathname}${url.search}`;
}

function revalidateTeam(companySlug?: string | null) {
  revalidatePath("/dashboard/team");
  revalidatePath("/dashboard");
  if (companySlug) revalidatePath(`/c/${companySlug}`);
}

async function createAndSendTeamInvite(input: {
  companyId: string;
  name: string;
  title: string;
  email: string;
  role: "admin" | "member";
  permissions?: string[];
}): Promise<
  | { ok: true; email: string; companySlug: string | null }
  | { ok: false; error: string }
> {
  const companyId = input.companyId.trim();
  const name = input.name.trim();
  const title = input.title.trim();
  const email = input.email.trim().toLowerCase();
  const role = input.role === "admin" ? "admin" : "member";
  const permissions = role === "member" ? (input.permissions ?? []) : [];

  if (!companyId || !name || !email) {
    return { ok: false, error: "Name, email, and company are required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in required." };

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, slug")
    .eq("id", companyId)
    .maybeSingle();

  if (!company) {
    return { ok: false, error: "Company not found." };
  }

  // Only owner may grant admin; admins invite as member.
  let effectiveRole: "admin" | "member" = role === "admin" ? "admin" : "member";
  if (effectiveRole === "admin") {
    const { data: membership } = await supabase
      .from("company_members")
      .select("role")
      .eq("company_id", companyId)
      .eq("user_id", user.id)
      .maybeSingle();
    const isOwner =
      membership?.role === "owner" ||
      (
        await supabase
          .from("companies")
          .select("owner_id")
          .eq("id", companyId)
          .maybeSingle()
      ).data?.owner_id === user.id;
    if (!isOwner) effectiveRole = "member";
  }

  const { data: token, error } = await supabase.rpc("create_team_invitation", {
    p_company_id: companyId,
    p_invite_name: name,
    p_invite_title: title,
    p_invite_email: email,
    p_role: effectiveRole,
    p_permissions: permissions,
  });

  if (error || !token) {
    return {
      ok: false,
      error: error?.message ?? "Could not create invite.",
    };
  }

  const inviterName =
    (
      await supabase
        .from("company_members")
        .select("display_name")
        .eq("company_id", companyId)
        .eq("user_id", user.id)
        .maybeSingle()
    ).data?.display_name?.trim() ||
    user.email ||
    "A teammate";

  await sendTeamJoinInviteEmail({
    to: email,
    inviterName,
    companyName: company.name,
    token: String(token),
  });

  return {
    ok: true,
    email,
    companySlug: (company.slug as string) ?? null,
  };
}

export async function inviteTeamMember(formData: FormData) {
  const companyId = String(formData.get("company_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const roleRaw = String(formData.get("role") ?? "member")
    .trim()
    .toLowerCase();
  const role = roleRaw === "admin" ? "admin" : "member";
  const back = safeBack(String(formData.get("back") ?? "/dashboard/team"));
  const { permissionsFromFormData } = await import(
    "@/features/workspace/sections"
  );
  const permissions = permissionsFromFormData(formData);

  const result = await createAndSendTeamInvite({
    companyId,
    name,
    title,
    email,
    role,
    permissions,
  });

  if (!result.ok) {
    redirect(backWith(back, { error: result.error }));
  }

  revalidateTeam(result.companySlug);
  redirect(backWith(back, { invited: "1" }));
}

/** Network map side panel — same invite flow, no full-page redirect. */
export async function inviteTeamMemberFromPanel(input: {
  companyId: string;
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  role: "admin" | "member";
}): Promise<{ ok: true; email: string } | { ok: false; error: string }> {
  const name = [input.firstName, input.lastName]
    .map((p) => p.trim())
    .filter(Boolean)
    .join(" ");

  const result = await createAndSendTeamInvite({
    companyId: input.companyId,
    name,
    title: input.title,
    email: input.email,
    role: input.role,
  });

  if (!result.ok) return result;
  revalidateTeam(result.companySlug);
  return { ok: true, email: result.email };
}

export async function cancelTeamInvitation(formData: FormData) {
  const id = String(formData.get("invitation_id") ?? "").trim();
  const back = safeBack(String(formData.get("back") ?? "/dashboard/team"));

  if (!id) {
    redirect(backWith(back, { error: "Missing invitation." }));
  }

  const result = await cancelTeamInvitationCore(id);
  if (!result.ok) {
    redirect(backWith(back, { error: result.error }));
  }

  revalidateTeam();
  redirect(backWith(back, { cancelled: "1" }));
}

async function cancelTeamInvitationCore(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!id) return { ok: false, error: "Missing invitation." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in required." };

  const { error } = await supabase
    .from("team_invitations")
    .update({
      status: "cancelled",
      resolved_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "pending");

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Network map side panel cancel — returns result for in-panel refresh. */
export async function cancelTeamInvitationFromPanel(
  invitationId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const result = await cancelTeamInvitationCore(invitationId.trim());
  if (result.ok) {
    revalidatePath("/dashboard/team");
    revalidatePath("/dashboard");
  }
  return result;
}

export async function respondTeamInvitation(formData: FormData) {
  const token = String(formData.get("token") ?? "").trim();
  const decision = String(formData.get("decision") ?? "")
    .trim()
    .toLowerCase();
  const publicVisible =
    String(formData.get("public_visible") ?? "") === "1" ||
    String(formData.get("public_visible") ?? "") === "true";
  const back = `/join/${token}`;

  if (!token || !["accepted", "declined"].includes(decision)) {
    redirect(`${back}?error=${encodeURIComponent("Invalid response.")}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);

  const { error } = await supabase.rpc("respond_team_invitation", {
    p_token: token,
    p_decision: decision,
    p_public_visible: decision === "accepted" ? publicVisible : false,
  });

  if (error) {
    redirect(
      `${back}?error=${encodeURIComponent(error.message ?? "Could not respond.")}`,
    );
  }

  if (decision === "declined") {
    redirect(`${back}?declined=1`);
  }

  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const ext =
      photo.type === "image/png"
        ? "png"
        : photo.type === "image/webp"
          ? "webp"
          : "jpg";
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("team-photos")
      .upload(path, photo, { upsert: true, contentType: photo.type });

    if (!uploadError) {
      const { data: pub } = supabase.storage
        .from("team-photos")
        .getPublicUrl(path);
      const { data: membership } = await supabase
        .from("company_members")
        .select("company_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (membership?.company_id && pub.publicUrl) {
        await supabase
          .from("company_members")
          .update({ photo_url: pub.publicUrl })
          .eq("company_id", membership.company_id)
          .eq("user_id", user.id);
      }
    }
  }

  revalidatePath("/dashboard/team");
  revalidatePath("/dashboard");
  redirect("/dashboard/team?joined=1");
}

export async function updateMyTeamProfile(formData: FormData) {
  const companyId = String(formData.get("company_id") ?? "").trim();
  const displayName = String(formData.get("display_name") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const publicVisible =
    String(formData.get("public_visible") ?? "") === "1" ||
    String(formData.get("public_visible") ?? "") === "on" ||
    String(formData.get("public_visible") ?? "") === "true";
  const back = safeBack(String(formData.get("back") ?? "/dashboard/team"));

  if (!companyId) {
    redirect(backWith(back, { error: "Missing company." }));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);

  const { data: company } = await supabase
    .from("companies")
    .select("slug")
    .eq("id", companyId)
    .maybeSingle();

  let photoUrl: string | undefined;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const ext =
      photo.type === "image/png"
        ? "png"
        : photo.type === "image/webp"
          ? "webp"
          : "jpg";
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("team-photos")
      .upload(path, photo, { upsert: true, contentType: photo.type });
    if (uploadError) {
      redirect(backWith(back, { error: uploadError.message }));
    }
    const { data: pub } = supabase.storage
      .from("team-photos")
      .getPublicUrl(path);
    photoUrl = `${pub.publicUrl}?t=${Date.now()}`;
  }

  const patch: {
    display_title: string;
    public_visible: boolean;
    display_name?: string;
    photo_url?: string;
  } = {
    display_title: title,
    public_visible: publicVisible,
  };
  if (displayName) patch.display_name = displayName;
  if (photoUrl) patch.photo_url = photoUrl;

  const { error } = await supabase
    .from("company_members")
    .update(patch)
    .eq("company_id", companyId)
    .eq("user_id", user.id);

  if (error) {
    redirect(backWith(back, { error: error.message }));
  }

  revalidateTeam(company?.slug);
  redirect(backWith(back, { profileUpdated: "1" }));
}

export async function leaveTeam(formData: FormData) {
  const companyId = String(formData.get("company_id") ?? "").trim();
  const back = safeBack(String(formData.get("back") ?? "/dashboard/team"));

  if (!companyId) {
    redirect(backWith(back, { error: "Missing company." }));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);

  const { data: row } = await supabase
    .from("company_members")
    .select("role")
    .eq("company_id", companyId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!row) {
    redirect(backWith(back, { error: "You are not on this team." }));
  }
  if (row.role === "owner") {
    redirect(backWith(back, { error: "Owners must transfer ownership before leaving." }));
  }

  const { error } = await supabase
    .from("company_members")
    .delete()
    .eq("company_id", companyId)
    .eq("user_id", user.id);

  if (error) {
    redirect(backWith(back, { error: error.message }));
  }

  revalidatePath("/dashboard/team");
  revalidatePath("/dashboard");
  redirect("/dashboard?leftTeam=1");
}

export async function updateMemberPermissions(formData: FormData) {
  const companyId = String(formData.get("company_id") ?? "").trim();
  const userId = String(formData.get("user_id") ?? "").trim();
  const back = safeBack(String(formData.get("back") ?? "/dashboard/team"));
  const { permissionsFromFormData } = await import(
    "@/features/workspace/sections"
  );
  const permissions = permissionsFromFormData(formData);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);

  const { error } = await supabase.rpc("set_member_section_permissions", {
    p_company_id: companyId,
    p_user_id: userId,
    p_permissions: permissions,
  });

  if (error) {
    redirect(backWith(back, { error: error.message }));
  }

  revalidateTeam();
  redirect(backWith(back, { accessUpdated: "1" }));
}
