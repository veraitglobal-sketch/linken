"use server";

import { revalidatePath } from "next/cache";
import { createTestimonialInviteCore } from "@/features/testimonials/core";
import { resolveAuthorCompanyByWebsite } from "@/features/testimonials/resolve-author-company";
import { getOperatorActiveCompany } from "@/features/workspace/require-operator";
import { sendTestimonialInviteEmail } from "@/lib/email";

type InviteResult =
  | {
      ok: true;
      token: string;
      url: string;
      linkedCompany: { id: string; name: string; slug: string } | null;
    }
  | { ok: false; error: string };

/** Owner creates a standalone invite (email + optional website unify). */
export async function createTestimonialInvite(input: {
  authorEmail: string;
  authorCompanyName?: string;
  website?: string;
  source?: "standalone" | "reference" | "case_study" | "partnership";
  sourceId?: string;
  authorCompanyId?: string;
}): Promise<InviteResult> {
  const { supabase, user, company } = await getOperatorActiveCompany();
  if (!user || !company) {
    return { ok: false, error: "Not signed in." };
  }

  const email = input.authorEmail.trim().toLowerCase();
  if (!email.includes("@")) {
    return { ok: false, error: "Enter a valid email address." };
  }

  let authorCompanyId = input.authorCompanyId ?? null;
  let linked: { id: string; name: string; slug: string } | null = null;

  if (!authorCompanyId && input.website?.trim()) {
    linked = await resolveAuthorCompanyByWebsite(supabase, input.website);
    if (linked) authorCompanyId = linked.id;
  }

  const result = await createTestimonialInviteCore(supabase, {
    companyId: company.id,
    source: input.source ?? "standalone",
    sourceId: input.sourceId,
    authorEmail: email,
    authorCompanyId,
  });

  if (!result.ok) return result;

  await sendTestimonialInviteEmail({
    to: email,
    providerName: company.name,
    testimonialUrl: result.data.url,
  });

  revalidatePath("/dashboard/testimonials");
  revalidatePath("/dashboard/widgets");
  return {
    ok: true,
    ...result.data,
    linkedCompany: linked,
  };
}
