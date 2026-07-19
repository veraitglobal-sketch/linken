import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { scheduleCompanyLogoFetch } from "@/features/logo/schedule";
import { buildMemberTree } from "@/features/groups/tree";
import { assertGhostDailyQuota } from "@/features/partners/ghost-quota";
import { uniqueCompanySlug } from "@/features/partners/unique-slug";
import { sendGroupInviteEmail } from "@/lib/email";
import { toSlug } from "@/lib/slug";

export type CoreResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

async function uniqueGroupSlug(admin: SupabaseClient, name: string) {
  const base = toSlug(name) || "group";
  let slug = base;
  let n = 0;
  while (n < 50) {
    const { data } = await admin
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

/** Resolve group for the keyed company (creator or confirmed member). */
export async function getGroupForCompanyCore(
  admin: SupabaseClient,
  companyId: string,
  ownerUserId: string,
): Promise<
  CoreResult<{
    group: {
      id: string;
      name: string;
      slug: string;
      description: string;
      website: string;
    };
    members: {
      company_id: string;
      slug: string;
      name: string;
      status: string;
      parent_company_id: string | null;
      pending_parent_company_id: string | null;
    }[];
    tree: ReturnType<typeof buildMemberTree>;
  }>
> {
  const { data: asCreator } = await admin
    .from("company_groups")
    .select("id, name, slug, description, website")
    .eq("created_by", ownerUserId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  let group = asCreator;

  if (!group) {
    const { data: membership } = await admin
      .from("company_group_members")
      .select("group_id")
      .eq("company_id", companyId)
      .in("status", ["confirmed", "pending"])
      .limit(1)
      .maybeSingle();
    if (membership?.group_id) {
      const { data: g } = await admin
        .from("company_groups")
        .select("id, name, slug, description, website")
        .eq("id", membership.group_id)
        .maybeSingle();
      group = g;
    }
  }

  if (!group) {
    return { ok: false, error: "No company group for this firm." };
  }

  const { data: rows } = await admin
    .from("company_group_members")
    .select(
      "status, parent_company_id, pending_parent_company_id, company:companies!company_id(id, slug, name)",
    )
    .eq("group_id", group.id);

  const members = (rows ?? []).map((row) => {
    const c = Array.isArray(row.company) ? row.company[0] : row.company;
    return {
      company_id: (c?.id as string) ?? "",
      slug: (c?.slug as string) ?? "",
      name: (c?.name as string) ?? "",
      status: row.status as string,
      parent_company_id: (row.parent_company_id as string | null) ?? null,
      pending_parent_company_id:
        (row.pending_parent_company_id as string | null) ?? null,
    };
  });

  const confirmedCards = members
    .filter((m) => m.status === "confirmed" && m.company_id)
    .map((m) => ({
      companyId: m.company_id,
      slug: m.slug,
      name: m.name,
      category: "",
      city: "",
      country: "",
      logoInitials: m.name.slice(0, 2).toUpperCase(),
      logoUrl: null as string | null,
      claimed: true,
      trustLevel: "Member" as const,
      confirmedReferences: 0,
      parentCompanyId: m.parent_company_id,
    }));

  return {
    ok: true,
    data: {
      group: {
        id: group.id as string,
        name: group.name as string,
        slug: group.slug as string,
        description: (group.description as string) ?? "",
        website: (group.website as string) ?? "",
      },
      members,
      tree: buildMemberTree(confirmedCards),
    },
  };
}

export async function createGroupCore(
  admin: SupabaseClient,
  input: {
    ownerUserId: string;
    companyId: string;
    name: string;
    description?: string;
    website?: string;
  },
): Promise<CoreResult<{ id: string; slug: string }>> {
  const name = input.name.trim();
  if (!name) return { ok: false, error: "Group name is required." };

  const { data: existing } = await admin
    .from("company_groups")
    .select("id")
    .eq("created_by", input.ownerUserId)
    .limit(1)
    .maybeSingle();
  if (existing) {
    return { ok: false, error: "You already have a company group." };
  }

  const slug = await uniqueGroupSlug(admin, name);
  const { data, error } = await admin
    .from("company_groups")
    .insert({
      name,
      slug,
      description: (input.description ?? "").trim(),
      website: (input.website ?? "").trim(),
      created_by: input.ownerUserId,
    })
    .select("id, slug")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Could not create group." };
  }

  // Seed creator's company as confirmed member
  await admin.from("company_group_members").insert({
    group_id: data.id,
    company_id: input.companyId,
    status: "confirmed",
    confirmed_at: new Date().toISOString(),
  });

  return {
    ok: true,
    data: { id: data.id as string, slug: data.slug as string },
  };
}

export async function createSubsidiaryCore(
  admin: SupabaseClient,
  input: {
    ownerUserId: string;
    companyId: string;
    name: string;
    category: string;
    city: string;
    country: string;
    website?: string | null;
    parentCompanyId?: string | null;
  },
): Promise<CoreResult<{ id: string; slug: string }>> {
  const name = input.name.trim();
  const category = input.category.trim();
  const city = input.city.trim();
  if (!name || !category || !city) {
    return { ok: false, error: "Name, category, and city are required." };
  }

  const groupRes = await getGroupForCompanyCore(
    admin,
    input.companyId,
    input.ownerUserId,
  );
  if (!groupRes.ok) return groupRes;

  const { data: groupMeta } = await admin
    .from("company_groups")
    .select("id, created_by")
    .eq("id", groupRes.data.group.id)
    .maybeSingle();

  if (!groupMeta || groupMeta.created_by !== input.ownerUserId) {
    return {
      ok: false,
      error: "Only the group creator can add subsidiaries.",
    };
  }

  const quota = await assertGhostDailyQuota(admin, input.companyId);
  if (!quota.ok) return { ok: false, error: quota.error };

  const parentId = input.parentCompanyId?.trim() || null;
  if (parentId) {
    const okParent = groupRes.data.members.some(
      (m) => m.company_id === parentId && m.status === "confirmed",
    );
    if (!okParent) {
      return {
        ok: false,
        error: "Parent must be a confirmed member of the same group.",
      };
    }
  }

  const slug = await uniqueCompanySlug(admin, name);
  const claimToken = crypto.randomUUID();
  const website = (input.website ?? "").trim();

  const { data: ghost, error: insertError } = await admin
    .from("companies")
    .insert({
      owner_id: null,
      claimed: false,
      claim_token: claimToken,
      created_by_company_id: parentId ?? input.companyId,
      name,
      slug,
      category,
      city,
      country: input.country.trim() || "",
      website: website || "",
      tagline: `${category} · ${city}`,
      description:
        "Branch profile created within the group. Claim this page to manage it locally.",
      services: [],
      verified: false,
    })
    .select("id, slug")
    .single();

  if (insertError || !ghost) {
    return {
      ok: false,
      error: insertError?.message ?? "Could not create subsidiary.",
    };
  }

  const { error: memError } = await admin.from("company_group_members").insert({
    group_id: groupRes.data.group.id,
    company_id: ghost.id,
    status: "confirmed",
    confirmed_at: new Date().toISOString(),
    parent_company_id: parentId,
  });

  if (memError) return { ok: false, error: memError.message };

  if (website) scheduleCompanyLogoFetch(ghost.id as string);

  return {
    ok: true,
    data: { id: ghost.id as string, slug: ghost.slug as string },
  };
}

export async function inviteCompanyToGroupCore(
  admin: SupabaseClient,
  input: {
    ownerUserId: string;
    companyId: string;
    companySlug: string;
    parentCompanyId?: string | null;
  },
): Promise<CoreResult<{ company_id: string; slug: string }>> {
  const groupRes = await getGroupForCompanyCore(
    admin,
    input.companyId,
    input.ownerUserId,
  );
  if (!groupRes.ok) return groupRes;

  const { data: groupMeta } = await admin
    .from("company_groups")
    .select("id, name, slug, created_by")
    .eq("id", groupRes.data.group.id)
    .maybeSingle();

  if (!groupMeta || groupMeta.created_by !== input.ownerUserId) {
    return { ok: false, error: "Only the group creator can invite." };
  }

  const slug = input.companySlug.trim().toLowerCase();
  const { data: target } = await admin
    .from("companies")
    .select("id, name, slug, owner_id, claimed")
    .eq("slug", slug)
    .maybeSingle();

  if (!target) return { ok: false, error: "Company not found." };
  if (target.claimed === false || !target.owner_id) {
    return {
      ok: false,
      error: "Invite claimed companies only — or add a subsidiary.",
    };
  }

  const parentId = input.parentCompanyId?.trim() || null;
  const { data: existing } = await admin
    .from("company_group_members")
    .select("status")
    .eq("group_id", groupMeta.id)
    .eq("company_id", target.id)
    .maybeSingle();

  if (existing?.status === "confirmed") {
    return { ok: false, error: "Company is already a confirmed member." };
  }
  if (existing?.status === "pending") {
    return { ok: false, error: "Invite already pending." };
  }

  if (!existing) {
    const { error } = await admin.from("company_group_members").insert({
      group_id: groupMeta.id,
      company_id: target.id,
      status: "pending",
      parent_company_id: parentId,
    });
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await admin
      .from("company_group_members")
      .update({
        status: "pending",
        invited_at: new Date().toISOString(),
        confirmed_at: null,
        ended_at: null,
        ended_by: null,
        parent_company_id: parentId,
        pending_parent_company_id: null,
      })
      .eq("group_id", groupMeta.id)
      .eq("company_id", target.id);
    if (error) return { ok: false, error: error.message };
  }

  if (target.owner_id) {
    const { data: ownerData } = await admin.auth.admin.getUserById(
      target.owner_id as string,
    );
    const email = ownerData.user?.email;
    if (email) {
      await sendGroupInviteEmail({
        to: email,
        groupName: groupMeta.name as string,
        companyName: target.name as string,
        groupSlug: groupMeta.slug as string,
      });
    }
  }

  return {
    ok: true,
    data: { company_id: target.id as string, slug: target.slug as string },
  };
}

export async function setGroupParentCore(
  admin: SupabaseClient,
  input: {
    ownerUserId: string;
    companyId: string;
    childCompanyId: string;
    parentCompanyId: string | null;
  },
): Promise<CoreResult<{ status: "set" | "proposed" }>> {
  const groupRes = await getGroupForCompanyCore(
    admin,
    input.companyId,
    input.ownerUserId,
  );
  if (!groupRes.ok) return groupRes;

  const { data: groupMeta } = await admin
    .from("company_groups")
    .select("created_by")
    .eq("id", groupRes.data.group.id)
    .maybeSingle();

  const { data: child } = await admin
    .from("companies")
    .select("id, claimed, owner_id")
    .eq("id", input.childCompanyId)
    .maybeSingle();
  if (!child) return { ok: false, error: "Child company not found." };

  const isCreator = groupMeta?.created_by === input.ownerUserId;
  const isChildOwner = child.owner_id === input.ownerUserId;
  const parentOwned =
    input.parentCompanyId != null &&
    (
      await admin
        .from("companies")
        .select("owner_id")
        .eq("id", input.parentCompanyId)
        .maybeSingle()
    ).data?.owner_id === input.ownerUserId;

  const direct =
    isCreator ||
    isChildOwner ||
    (parentOwned && child.claimed !== true);

  if (!direct && !parentOwned) {
    return { ok: false, error: "Not allowed to set parent." };
  }

  if (direct) {
    const { data, error } = await admin
      .from("company_group_members")
      .update({
        parent_company_id: input.parentCompanyId,
        pending_parent_company_id: null,
      })
      .eq("group_id", groupRes.data.group.id)
      .eq("company_id", input.childCompanyId)
      .eq("status", "confirmed")
      .select("company_id")
      .maybeSingle();
    if (error) return { ok: false, error: error.message };
    if (!data) {
      return { ok: false, error: "Company is not a confirmed member." };
    }
    return { ok: true, data: { status: "set" } };
  }

  const { data, error } = await admin
    .from("company_group_members")
    .update({ pending_parent_company_id: input.parentCompanyId })
    .eq("group_id", groupRes.data.group.id)
    .eq("company_id", input.childCompanyId)
    .eq("status", "confirmed")
    .select("company_id")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) {
    return { ok: false, error: "Company is not a confirmed member." };
  }
  return { ok: true, data: { status: "proposed" } };
}

export async function endGroupMembershipCore(
  admin: SupabaseClient,
  input: {
    ownerUserId: string;
    companyId: string;
    targetCompanyId: string;
  },
): Promise<CoreResult<{ company_id: string }>> {
  const groupRes = await getGroupForCompanyCore(
    admin,
    input.companyId,
    input.ownerUserId,
  );
  if (!groupRes.ok) return groupRes;

  const { data: groupMeta } = await admin
    .from("company_groups")
    .select("created_by")
    .eq("id", groupRes.data.group.id)
    .maybeSingle();

  const { data: target } = await admin
    .from("companies")
    .select("owner_id")
    .eq("id", input.targetCompanyId)
    .maybeSingle();

  const isCreator = groupMeta?.created_by === input.ownerUserId;
  const isTargetOwner = target?.owner_id === input.ownerUserId;
  if (!isCreator && !isTargetOwner) {
    return {
      ok: false,
      error: "Only the company owner or group creator can end membership.",
    };
  }

  const endedBy = isTargetOwner ? "company" : "group";
  const { data, error } = await admin
    .from("company_group_members")
    .update({
      status: "ended",
      ended_at: new Date().toISOString(),
      ended_by: endedBy,
      parent_company_id: null,
      pending_parent_company_id: null,
    })
    .eq("group_id", groupRes.data.group.id)
    .eq("company_id", input.targetCompanyId)
    .eq("status", "confirmed")
    .select("company_id")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "No confirmed membership to end." };
  return { ok: true, data: { company_id: input.targetCompanyId } };
}
