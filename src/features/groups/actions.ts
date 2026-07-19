"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { scheduleCompanyLogoFetch } from "@/features/logo/schedule";
import { uniqueCompanySlug } from "@/features/partners/unique-slug";
import { sendGroupInviteEmail, sendTeamInviteEmail } from "@/lib/email";
import { toSlug } from "@/lib/slug";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function uniqueGroupSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  name: string,
) {
  const base = toSlug(name) || "group";
  let slug = base;
  let n = 0;
  while (n < 50) {
    const { data } = await supabase
      .from("company_groups")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function createGroup(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const back = "/dashboard/group";

  if (!name) {
    redirect(`${back}?error=${encodeURIComponent("Group name is required.")}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);

  const slug = await uniqueGroupSlug(supabase, name);
  const { data, error } = await supabase
    .from("company_groups")
    .insert({
      name,
      slug,
      description,
      website,
      created_by: user.id,
    })
    .select("slug")
    .single();

  if (error || !data) {
    redirect(
      `${back}?error=${encodeURIComponent(error?.message ?? "Could not create group.")}`,
    );
  }

  revalidatePath(back);
  revalidatePath(`/g/${data.slug}`);
  redirect(`${back}?created=1`);
}

export async function inviteCompanyToGroup(formData: FormData) {
  const groupId = String(formData.get("group_id") ?? "").trim();
  const companySlug = String(formData.get("company_slug") ?? "")
    .trim()
    .toLowerCase();
  const parentCompanyId = String(formData.get("parent_company_id") ?? "").trim();
  const back = "/dashboard/group";

  if (!groupId || !companySlug) {
    redirect(`${back}?error=${encodeURIComponent("Group and company slug are required.")}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);

  const { data: group } = await supabase
    .from("company_groups")
    .select("id, name, slug, created_by")
    .eq("id", groupId)
    .maybeSingle();

  if (!group || group.created_by !== user.id) {
    redirect(`${back}?error=${encodeURIComponent("Only the group creator can invite.")}`);
  }

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, slug, owner_id, claimed")
    .eq("slug", companySlug)
    .maybeSingle();

  if (!company) {
    redirect(`${back}?error=${encodeURIComponent("Company not found.")}`);
  }
  if (company.claimed === false || !company.owner_id) {
    redirect(
      `${back}?error=${encodeURIComponent("Invite claimed companies only — or add a subsidiary.")}`,
    );
  }

  const { error } = await supabase.rpc("upsert_group_invite", {
    p_group_id: group.id,
    p_company_id: company.id,
    p_parent_company_id: parentCompanyId || null,
  });

  if (error) {
    redirect(`${back}?error=${encodeURIComponent(error.message)}`);
  }

  const admin = createAdminClient();
  if (admin && company.owner_id) {
    const { data: ownerData } = await admin.auth.admin.getUserById(
      company.owner_id,
    );
    const email = ownerData.user?.email;
    if (email) {
      await sendGroupInviteEmail({
        to: email,
        groupName: group.name,
        companyName: company.name,
        groupSlug: group.slug,
      });
    }
  }

  revalidatePath(back);
  revalidatePath(`/g/${group.slug}`);
  redirect(`${back}?invited=${encodeURIComponent(company.slug)}`);
}

export async function respondGroupMembership(formData: FormData) {
  const groupId = String(formData.get("group_id") ?? "").trim();
  const companyId = String(formData.get("company_id") ?? "").trim();
  const decision = String(formData.get("decision") ?? "").trim();
  const back = "/dashboard";

  if (!groupId || !companyId || !["confirmed", "declined"].includes(decision)) {
    redirect(`${back}?error=${encodeURIComponent("Invalid group response.")}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);

  const { error } = await supabase.rpc("respond_group_membership", {
    p_group_id: groupId,
    p_company_id: companyId,
    p_decision: decision,
  });

  if (error) {
    redirect(`${back}?error=${encodeURIComponent(error.message)}`);
  }

  const { data: group } = await supabase
    .from("company_groups")
    .select("slug")
    .eq("id", groupId)
    .maybeSingle();

  revalidatePath(back);
  revalidatePath("/dashboard/group");
  if (group?.slug) revalidatePath(`/g/${group.slug}`);
  redirect(
    decision === "confirmed"
      ? `${back}?groupJoined=1`
      : `${back}?groupDeclined=1`,
  );
}

export async function respondGroupParent(formData: FormData) {
  const groupId = String(formData.get("group_id") ?? "").trim();
  const companyId = String(formData.get("company_id") ?? "").trim();
  const decision = String(formData.get("decision") ?? "").trim();
  const back = "/dashboard";

  if (!groupId || !companyId || !["confirmed", "declined"].includes(decision)) {
    redirect(`${back}?error=${encodeURIComponent("Invalid parent response.")}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);

  const { error } = await supabase.rpc("respond_group_parent", {
    p_group_id: groupId,
    p_company_id: companyId,
    p_decision: decision,
  });

  if (error) redirect(`${back}?error=${encodeURIComponent(error.message)}`);

  const { data: group } = await supabase
    .from("company_groups")
    .select("slug")
    .eq("id", groupId)
    .maybeSingle();

  revalidatePath(back);
  revalidatePath("/dashboard/group");
  if (group?.slug) revalidatePath(`/g/${group.slug}`);
  redirect(back);
}

export async function createSubsidiary(formData: FormData) {
  const groupId = String(formData.get("group_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const parentCompanyId = String(formData.get("parent_company_id") ?? "").trim();
  const backRaw = String(formData.get("back") ?? "").trim();
  const back = backRaw.startsWith("/dashboard") ? backRaw : "/dashboard/group";

  if (!groupId || !name || !category || !city) {
    redirect(
      `${back}?error=${encodeURIComponent("Name, category, and city are required.")}`,
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);

  const { data: group } = await supabase
    .from("company_groups")
    .select("id, slug")
    .eq("id", groupId)
    .maybeSingle();

  if (!group) {
    redirect(`${back}?error=${encodeURIComponent("Group not found.")}`);
  }

  const slug = await uniqueCompanySlug(supabase, name);
  const claimToken = crypto.randomUUID();

  const { data, error } = await supabase.rpc("create_group_subsidiary", {
    p_group_id: group.id,
    p_name: name,
    p_category: category,
    p_city: city,
    p_country: country,
    p_slug: slug,
    p_claim_token: claimToken,
    p_parent_company_id: parentCompanyId || null,
    p_website: website || null,
  });

  if (error) {
    redirect(`${back}?error=${encodeURIComponent(error.message)}`);
  }

  const row = Array.isArray(data) ? data[0] : data;
  const companySlug = (row?.company_slug as string | undefined) ?? slug;
  const companyId = row?.company_id as string | undefined;

  if (website && companyId) {
    scheduleCompanyLogoFetch(companyId);
  }

  revalidatePath(back);
  revalidatePath("/dashboard/group");
  revalidatePath(`/g/${group.slug}`);
  revalidatePath(`/c/${companySlug}`);
  redirect(`${back}?subsidiary=${encodeURIComponent(companySlug)}`);
}

export async function endGroupMembership(formData: FormData) {
  const groupId = String(formData.get("group_id") ?? "").trim();
  const companyId = String(formData.get("company_id") ?? "").trim();
  const backRaw = String(formData.get("back") ?? "").trim();
  const back = backRaw.startsWith("/dashboard") ? backRaw : "/dashboard";

  if (!groupId || !companyId) {
    redirect(`${back}?error=${encodeURIComponent("Missing group or company.")}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);

  const { error } = await supabase.rpc("end_group_membership", {
    p_group_id: groupId,
    p_company_id: companyId,
  });

  if (error) {
    redirect(`${back}?error=${encodeURIComponent(error.message)}`);
  }

  const { data: group } = await supabase
    .from("company_groups")
    .select("slug")
    .eq("id", groupId)
    .maybeSingle();

  revalidatePath(back);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/group");
  if (group?.slug) revalidatePath(`/g/${group.slug}`);
  redirect(`${back}?leftGroup=1`);
}

export async function proposeGroupParent(formData: FormData) {
  const groupId = String(formData.get("group_id") ?? "").trim();
  const companyId = String(formData.get("company_id") ?? "").trim();
  const parentCompanyId = String(formData.get("parent_company_id") ?? "").trim();
  const back = "/dashboard/group";

  if (!groupId || !companyId || !parentCompanyId) {
    redirect(`${back}?error=${encodeURIComponent("Parent and company required.")}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);

  const { error } = await supabase.rpc("propose_group_parent", {
    p_group_id: groupId,
    p_company_id: companyId,
    p_parent_company_id: parentCompanyId,
  });

  if (error) redirect(`${back}?error=${encodeURIComponent(error.message)}`);

  revalidatePath(back);
  redirect(`${back}?parentProposed=1`);
}

export async function addTeamMember(formData: FormData) {
  const companyId = String(formData.get("company_id") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const back = "/dashboard/team";

  if (!companyId || !email) {
    redirect(`${back}?error=${encodeURIComponent("Company and email are required.")}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, slug, owner_id")
    .eq("id", companyId)
    .eq("owner_id", user.id)
    .eq("claimed", true)
    .maybeSingle();

  if (!company) {
    redirect(`${back}?error=${encodeURIComponent("Only the company owner can invite teammates.")}`);
  }

  const admin = createAdminClient();
  if (!admin) {
    redirect(
      `${back}?error=${encodeURIComponent("Team invites need SUPABASE_SERVICE_ROLE_KEY.")}`,
    );
  }

  const { data: existingUserId } = await admin.rpc("lookup_user_id_by_email", {
    p_email: email,
  });

  if (existingUserId) {
    const { error } = await supabase.from("company_members").insert({
      company_id: company.id,
      user_id: existingUserId as string,
      role: "member",
    });
    if (error) {
      redirect(
        `${back}?error=${encodeURIComponent(error.message.includes("duplicate") ? "Already a member." : error.message)}`,
      );
    }
    revalidatePath(back);
    redirect(`${back}?added=1`);
  }

  // TODO: auto-link membership when this email registers (webhook / onboarding hook).
  await sendTeamInviteEmail({
    to: email,
    companyName: company.name,
    inviterHint: user.email ?? "A teammate",
  });

  revalidatePath(back);
  redirect(`${back}?invitedEmail=1`);
}
