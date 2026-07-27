"use server";

import { revalidatePath } from "next/cache";
import { createTestimonialInviteCore } from "@/features/testimonials/core";
import { getOperatorActiveCompany } from "@/features/workspace/require-operator";

type InviteResult =
  | { ok: true; token: string; url: string }
  | { ok: false; error: string };

/** Owner creates a standalone testimonial invite (client writes via token). */
export async function createTestimonialInvite(input: {
  authorEmail?: string;
  authorCompanyId?: string;
  source?: "standalone" | "reference" | "case_study" | "partnership";
  sourceId?: string;
}): Promise<InviteResult> {
  const { supabase, user, company } = await getOperatorActiveCompany();
  if (!user || !company) {
    return { ok: false, error: "Not signed in." };
  }

  const result = await createTestimonialInviteCore(supabase, {
    companyId: company.id,
    source: input.source,
    sourceId: input.sourceId,
    authorEmail: input.authorEmail,
    authorCompanyId: input.authorCompanyId,
  });

  if (!result.ok) return result;

  revalidatePath("/dashboard/widgets");
  return { ok: true, ...result.data };
}
