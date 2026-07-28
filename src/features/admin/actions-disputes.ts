"use server";

import { revalidatePath } from "next/cache";
import { requirePlatformStaff } from "@/features/admin/require-platform-admin";
import { runAdminAction } from "@/features/admin/run-admin-action";
import { createAdminClient } from "@/lib/supabase/admin";

const RECORD_TYPES = {
  testimonial: { table: "testimonials", hidden: "withdrawn" },
  service_reference: { table: "service_references", hidden: "declined" },
  partnership: { table: "partnerships", hidden: "cancelled" },
  case_study_confirmation: {
    table: "case_study_client_confirmation_requests",
    hidden: "declined",
  },
} as const;

type RecordType = keyof typeof RECORD_TYPES;

function isRecordType(v: string): v is RecordType {
  return v in RECORD_TYPES;
}

/** Hides a record immediately and stores its prior status for later resolution. */
export async function adminOpenDispute(formData: FormData) {
  const actor = await requirePlatformStaff("admin");
  const recordType = String(formData.get("recordType") ?? "");
  const recordId = String(formData.get("recordId") ?? "");
  const claimantCompanyId = String(formData.get("claimantCompanyId") ?? "");
  const counterpartyCompanyId = String(formData.get("counterpartyCompanyId") ?? "") || null;
  const claim = String(formData.get("claim") ?? "");
  const reason = String(formData.get("reason") ?? "");

  if (!isRecordType(recordType) || !recordId || !claimantCompanyId || !claim.trim()) {
    return { ok: false as const, error: "Missing required fields." };
  }

  const admin = createAdminClient();
  if (!admin) return { ok: false as const, error: "Admin client unavailable." };

  const { table, hidden } = RECORD_TYPES[recordType];
  const { data: record } = await admin.from(table).select("status").eq("id", recordId).maybeSingle();
  if (!record) return { ok: false as const, error: "Record not found." };

  const result = await runAdminAction({
    actor,
    action: "dispute.open",
    target: { type: recordType, id: recordId },
    reason,
    before: { status: record.status },
    run: async () => {
      const { error: hideErr } = await admin.from(table).update({ status: hidden }).eq("id", recordId);
      if (hideErr) throw new Error(hideErr.message);

      const { error: insertErr } = await admin.from("trust_disputes").insert({
        record_type: recordType,
        record_id: recordId,
        claimant_company_id: claimantCompanyId,
        counterparty_company_id: counterpartyCompanyId,
        claim,
        prior_public_state: { status: record.status },
      });
      if (insertErr) throw new Error(insertErr.message);

      return { result: true, after: { status: hidden } };
    },
  });

  if (result.ok) revalidatePath("/admin/disputes");
  return result.ok ? { ok: true as const } : { ok: false as const, error: result.error };
}

export async function adminResolveDispute(formData: FormData) {
  const actor = await requirePlatformStaff("admin");
  const disputeId = String(formData.get("disputeId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const reason = String(formData.get("reason") ?? "");

  if (!disputeId || (decision !== "confirm" && decision !== "remove")) {
    return { ok: false as const, error: "Invalid decision." };
  }

  const admin = createAdminClient();
  if (!admin) return { ok: false as const, error: "Admin client unavailable." };

  const { data: dispute } = await admin
    .from("trust_disputes")
    .select("record_type, record_id, prior_public_state, status")
    .eq("id", disputeId)
    .maybeSingle();
  if (!dispute || dispute.status !== "open") {
    return { ok: false as const, error: "Dispute not open." };
  }
  if (!isRecordType(dispute.record_type as string)) {
    return { ok: false as const, error: "Unknown record type." };
  }

  const nextStatus = decision === "confirm" ? "confirmed" : "removed";

  const result = await runAdminAction({
    actor,
    action: `dispute.${decision}`,
    target: { type: dispute.record_type as string, id: dispute.record_id as string },
    reason,
    before: { disputeStatus: "open" },
    run: async () => {
      if (decision === "confirm") {
        const { table } = RECORD_TYPES[dispute.record_type as RecordType];
        const prior = (dispute.prior_public_state as { status?: string } | null)?.status;
        if (prior) {
          const { error } = await admin.from(table).update({ status: prior }).eq("id", dispute.record_id);
          if (error) throw new Error(error.message);
        }
      }

      const { error: updateErr } = await admin
        .from("trust_disputes")
        .update({
          status: nextStatus,
          resolved_at: new Date().toISOString(),
          resolved_by: actor.user.id,
          resolution_reason: reason,
        })
        .eq("id", disputeId);
      if (updateErr) throw new Error(updateErr.message);

      return { result: true, after: { disputeStatus: nextStatus } };
    },
  });

  if (result.ok) revalidatePath("/admin/disputes");
  return result.ok ? { ok: true as const } : { ok: false as const, error: result.error };
}
