import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/** Dedupe unmatched free-text so we can add an alias later. Never logs PII. */
export async function recordCategoryUnmatched(text: string) {
  const sample = text.trim().slice(0, 80);
  const key = sample.toLowerCase();
  if (!key) return;
  const admin = createAdminClient();
  if (!admin) return;
  const { error } = await admin.rpc("record_category_unmatched", {
    p_text: sample,
  });
  if (error) console.error("[category_unmatched]", error.message);
}
