"use server";

import { revalidatePath } from "next/cache";
import { notifyPartnershipEnded } from "@/features/network/partnership-lifecycle";
import { createClient } from "@/lib/supabase/server";

export type GraphActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

function revalidateGraph() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/structure");
  revalidatePath("/dashboard/group");
  revalidatePath("/dashboard/partners");
}

function companyIdFromNodeId(nodeId: string): string | null {
  if (!nodeId.startsWith("company:")) return null;
  return nodeId.slice("company:".length);
}

type ViewerGate =
  | { ok: true; companyId: string }
  | { ok: false; error: string };

async function requireViewerDomainVerified(userId: string): Promise<ViewerGate> {
  const { resolveActiveWorkspace } = await import(
    "@/features/workspace/context"
  );
  const workspace = await resolveActiveWorkspace();
  if (
    !workspace?.company ||
    workspace.userId !== userId ||
    workspace.active?.type !== "company"
  ) {
    return { ok: false, error: "Switch to a company workspace first." };
  }

  const supabase = await createClient();
  const { data: mine } = await supabase
    .from("companies")
    .select("id, verified")
    .eq("id", workspace.company.id)
    .eq("owner_id", userId)
    .eq("claimed", true)
    .maybeSingle();

  if (!mine) return { ok: false, error: "Create your company first." };
  if (!mine.verified) {
    return {
      ok: false,
      error: "Verify your domain first — then you can link firms on the graph.",
    };
  }
  return { ok: true, companyId: mine.id };
}

/**
 * Wire two company nodes on the graph.
 * - structure: child hangs under parent (set_group_parent)
 * - partner: pending/accepted partnership request
 */
export async function connectGraphNodes(input: {
  mode: "structure" | "partner";
  sourceNodeId: string;
  targetNodeId: string;
  groupId?: string | null;
}): Promise<GraphActionResult> {
  const parentId = companyIdFromNodeId(input.sourceNodeId);
  const childId = companyIdFromNodeId(input.targetNodeId);

  if (!parentId || !childId) {
    return { ok: false, error: "Connect company cards — not the group hub." };
  }
  if (parentId === childId) {
    return { ok: false, error: "Cannot connect a company to itself." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in required." };

  const viewer = await requireViewerDomainVerified(user.id);
  if (!viewer.ok) return viewer;

  if (input.mode === "structure") {
    if (!input.groupId) {
      return {
        ok: false,
        error: "Create a company group first, then drag ownership links.",
      };
    }

    const { error } = await supabase.rpc("set_group_parent", {
      p_group_id: input.groupId,
      p_company_id: childId,
      p_parent_company_id: parentId,
    });

    if (error) return { ok: false, error: error.message };
    revalidateGraph();
    return { ok: true, message: "Child firm attached under parent." };
  }

  // Partner mode — prefer viewer company as requester when it is an endpoint
  const mine = { id: viewer.companyId };
  const requesterId =
    mine.id === parentId || mine.id === childId ? mine.id : parentId;
  const recipientId = requesterId === parentId ? childId : parentId;

  const { data: existing } = await supabase
    .from("partnerships")
    .select("id, status")
    .or(
      `and(requester_id.eq.${parentId},recipient_id.eq.${childId}),and(requester_id.eq.${childId},recipient_id.eq.${parentId})`,
    )
    .maybeSingle();

  if (existing?.status === "accepted") {
    return { ok: false, error: "Already partners." };
  }
  if (existing?.status === "pending") {
    return { ok: false, error: "Partnership request already pending." };
  }

  if (existing) {
    const { error } = await supabase
      .from("partnerships")
      .update({
        requester_id: requesterId,
        recipient_id: recipientId,
        status: "pending",
        responded_at: null,
      })
      .eq("id", existing.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from("partnerships").insert({
      requester_id: requesterId,
      recipient_id: recipientId,
      status: "pending",
    });
    if (error) return { ok: false, error: error.message };
  }

  revalidateGraph();
  return {
    ok: true,
    message: "Partner request sent — visible after they confirm.",
  };
}

/** Move an existing structure edge to a new parent (n8n-style reconnect). */
export async function reconnectStructureLink(input: {
  groupId: string;
  childCompanyId: string;
  newParentCompanyId: string | null;
}): Promise<GraphActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in required." };

  const { error } = await supabase.rpc("set_group_parent", {
    p_group_id: input.groupId,
    p_company_id: input.childCompanyId,
    p_parent_company_id: input.newParentCompanyId,
  });

  if (error) return { ok: false, error: error.message };
  revalidateGraph();
  return { ok: true, message: "Firm moved under the new parent." };
}

/** Detach without full page redirect — for live graph editor. */
export async function disconnectGraphEdge(input: {
  edgeType: string;
  partnershipId?: string;
  groupId?: string;
  memberCompanyId?: string;
}): Promise<GraphActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in required." };

  if (input.edgeType === "partner") {
    if (!input.partnershipId) {
      return { ok: false, error: "Missing partnership." };
    }
    const { error } = await supabase.rpc("end_partnership", {
      p_partnership_id: input.partnershipId,
    });
    if (error) return { ok: false, error: error.message };

    const { resolveActiveWorkspace } = await import(
      "@/features/workspace/context"
    );
    const workspace = await resolveActiveWorkspace();
    if (workspace?.company?.id) {
      await notifyPartnershipEnded(
        input.partnershipId,
        workspace.company.id,
      );
    }

    revalidateGraph();
    return { ok: true, message: "Partnership detached." };
  }

  if (input.edgeType === "subsidiary" || input.edgeType === "member_of") {
    // Structure detach = clear parent (keep in group) when subsidiary;
    // member_of from hub → end membership entirely.
    if (input.edgeType === "subsidiary" && input.groupId && input.memberCompanyId) {
      const { error } = await supabase.rpc("set_group_parent", {
        p_group_id: input.groupId,
        p_company_id: input.memberCompanyId,
        p_parent_company_id: null,
      });
      if (error) return { ok: false, error: error.message };
      revalidateGraph();
      return {
        ok: true,
        message: "Detached from parent — still in group. Drag onto another firm to reattach.",
      };
    }

    if (!input.groupId || !input.memberCompanyId) {
      return { ok: false, error: "Missing group link." };
    }
    const { error } = await supabase.rpc("end_group_membership", {
      p_group_id: input.groupId,
      p_company_id: input.memberCompanyId,
    });
    if (error) return { ok: false, error: error.message };
    revalidateGraph();
    return { ok: true, message: "Removed from group structure." };
  }

  return {
    ok: false,
    error: "Client links come from confirmed references — edit on the profile.",
  };
}

/**
 * Add an existing Linken company into this workspace graph.
 * - partner: partnership request (pending until they confirm)
 * - group: invite into company group (optionally under a parent firm)
 */
export async function addExistingCompanyToWorkspace(input: {
  companySlug: string;
  intent: "partner" | "group";
  groupId?: string | null;
  parentCompanyId?: string | null;
}): Promise<GraphActionResult> {
  const slug = input.companySlug.trim().toLowerCase();
  if (!slug) return { ok: false, error: "Pick a company." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in required." };

  const viewer = await requireViewerDomainVerified(user.id);
  if (!viewer.ok) return viewer;

  const { data: target } = await supabase
    .from("companies")
    .select("id, slug, name, claimed, verified")
    .eq("slug", slug)
    .maybeSingle();

  if (!target) return { ok: false, error: "Company not found." };
  if (target.claimed === false) {
    return {
      ok: false,
      error: "That profile is unclaimed — use Create child firm, or wait until they claim.",
    };
  }

  if (input.intent === "partner") {
    if (viewer.companyId === target.id) {
      return { ok: false, error: "That is already your company." };
    }

    return connectGraphNodes({
      mode: "partner",
      sourceNodeId: `company:${viewer.companyId}`,
      targetNodeId: `company:${target.id}`,
    });
  }

  // Group invite — can invite before they verify; they stay muted until domain verify
  if (!input.groupId) {
    return {
      ok: false,
      error: "Create a company group first, then invite firms into it.",
    };
  }

  const { data: group } = await supabase
    .from("company_groups")
    .select("id, created_by, slug")
    .eq("id", input.groupId)
    .maybeSingle();

  if (!group || group.created_by !== user.id) {
    return { ok: false, error: "Only the group creator can invite companies." };
  }

  const { error } = await supabase.rpc("upsert_group_invite", {
    p_group_id: group.id,
    p_company_id: target.id,
    p_parent_company_id: input.parentCompanyId || null,
  });

  if (error) return { ok: false, error: error.message };
  revalidateGraph();
  return {
    ok: true,
    message: target.verified
      ? `Invite sent to ${target.name}. They must confirm before it shows.`
      : `Invite sent to ${target.name}. After they confirm, domain verify is still required for full trust.`,
  };
}
