import "server-only";

import { revalidatePath } from "next/cache";
import { verifySlackPartnershipAction } from "@/features/slack/action-token";
import { createAdminClient } from "@/lib/supabase/admin";

type Result = { ok: true; message: string } | { ok: false; message: string };

/**
 * Accept/decline from Slack button. Only the Slack user who Connected may act.
 * Multi-tenant: companyId from signed value; team_id must match company_slack.
 */
export async function respondPartnershipFromSlack(input: {
  actionValue: string;
  slackUserId: string;
  slackTeamId: string;
}): Promise<Result> {
  const parsed = verifySlackPartnershipAction(input.actionValue);
  if (!parsed) {
    return { ok: false, message: "This button expired. Open Hansala to respond." };
  }

  const admin = createAdminClient();
  if (!admin) return { ok: false, message: "Service unavailable." };

  const { data: slack } = await admin
    .from("company_slack")
    .select("company_id, team_id, slack_user_id")
    .eq("company_id", parsed.companyId)
    .maybeSingle();

  if (!slack) {
    return { ok: false, message: "Slack is not connected for this company." };
  }
  if ((slack.team_id as string) !== input.slackTeamId) {
    return { ok: false, message: "Workspace mismatch." };
  }
  const allowed = (slack.slack_user_id as string) || "";
  if (!allowed || allowed !== input.slackUserId) {
    return {
      ok: false,
      message:
        "Only the person who connected Slack can use these buttons. Open Hansala to respond.",
    };
  }

  const { data: row } = await admin
    .from("partnerships")
    .select("id, status, recipient_id, requester_id")
    .eq("id", parsed.partnershipId)
    .maybeSingle();

  if (!row || row.status !== "pending") {
    return { ok: false, message: "Request already closed." };
  }
  if (row.recipient_id !== parsed.companyId) {
    return { ok: false, message: "Not allowed for this company." };
  }

  const respondedAt = new Date().toISOString();
  const { error } = await admin
    .from("partnerships")
    .update({ status: parsed.decision === "accepted" ? "accepted" : "rejected", responded_at: respondedAt })
    .eq("id", parsed.partnershipId)
    .eq("status", "pending");

  if (error) return { ok: false, message: error.message };

  if (parsed.decision === "accepted") {
    await emitAccepted(admin, parsed.partnershipId, row, respondedAt);
  }

  revalidatePath("/dashboard/partners");
  revalidatePath("/dashboard");
  return {
    ok: true,
    message:
      parsed.decision === "accepted"
        ? "Partnership confirmed on Hansala."
        : "Partnership declined.",
  };
}

async function emitAccepted(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  partnershipId: string,
  row: { requester_id: unknown; recipient_id: unknown },
  respondedAt: string,
) {
  const { data: firms } = await admin
    .from("companies")
    .select("id, name, slug")
    .in("id", [row.requester_id as string, row.recipient_id as string]);
  const byId = new Map(
    (firms ?? []).map((f) => [
      f.id as string,
      { name: (f.name as string) ?? "", slug: (f.slug as string) ?? "" },
    ]),
  );
  const requester = byId.get(row.requester_id as string);
  const recipient = byId.get(row.recipient_id as string);
  const { emitWebhookEvent } = await import("@/features/webhooks/dispatch");
  const base = {
    partnership_id: partnershipId,
    requester_id: row.requester_id,
    recipient_id: row.recipient_id,
    requester_name: requester?.name ?? null,
    recipient_name: recipient?.name ?? null,
    responded_at: respondedAt,
    via: "slack",
  };
  emitWebhookEvent(
    row.recipient_id as string,
    "partnership.accepted",
    {
      ...base,
      for_company_id: row.recipient_id,
      for_company_name: recipient?.name ?? null,
      for_company_slug: recipient?.slug ?? null,
    },
    `partnership_${partnershipId}`,
  );
  emitWebhookEvent(
    row.requester_id as string,
    "partnership.accepted",
    {
      ...base,
      for_company_id: row.requester_id,
      for_company_name: requester?.name ?? null,
      for_company_slug: requester?.slug ?? null,
    },
    `partnership_${partnershipId}`,
  );
}
