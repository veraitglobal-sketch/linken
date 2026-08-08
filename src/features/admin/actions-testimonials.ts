"use server";

import { revalidatePath } from "next/cache";
import { requirePlatformStaff } from "@/features/admin/require-platform-admin";
import { runAdminAction } from "@/features/admin/run-admin-action";
import { createAdminClient } from "@/lib/supabase/admin";

type TestimonialSlugRow = { status: string; companies: { slug?: string } | null };

function revalidateTestimonials(slug?: string) {
  revalidatePath("/admin/testimonials");
  revalidatePath("/dashboard/testimonials");
  if (slug) {
    revalidatePath(`/c/${slug}`);
    revalidatePath(`/embed/${slug}`);
  }
}

/** Hide sets status → withdrawn only. Never touches body/author fields. */
export async function adminHideTestimonial(formData: FormData) {
  const actor = await requirePlatformStaff("admin");
  const id = String(formData.get("id") ?? "");
  const reason = String(formData.get("reason") ?? "");
  if (!id) return { ok: false as const, error: "Missing testimonial." };

  const admin = createAdminClient();
  if (!admin) return { ok: false as const, error: "Admin client unavailable." };

  const { data: before } = await admin
    .from("testimonials")
    .select("status, companies!inner(slug)")
    .eq("id", id)
    .maybeSingle<TestimonialSlugRow>();

  const result = await runAdminAction({
    actor,
    action: "testimonial.hide",
    target: { type: "testimonial", id },
    reason,
    before: { status: before?.status ?? null },
    run: async () => {
      const { error } = await admin
        .from("testimonials")
        .update({ status: "withdrawn" })
        .eq("id", id);
      if (error) throw new Error(error.message);
      return { result: true, after: { status: "withdrawn" } };
    },
  });

  if (result.ok) revalidateTestimonials(before?.companies?.slug);
  return result.ok ? { ok: true as const } : { ok: false as const, error: result.error };
}

/**
 * Unhide restores status → published only when consent + body still exist;
 * otherwise it lands back in pending. Never rewrites body/author fields.
 */
export async function adminUnhideTestimonial(formData: FormData) {
  const actor = await requirePlatformStaff("admin");
  const id = String(formData.get("id") ?? "");
  const reason = String(formData.get("reason") ?? "");
  if (!id) return { ok: false as const, error: "Missing testimonial." };

  const admin = createAdminClient();
  if (!admin) return { ok: false as const, error: "Admin client unavailable." };

  const { data: row } = await admin
    .from("testimonials")
    .select("status, consent_public, body, published_at, companies!inner(slug)")
    .eq("id", id)
    .maybeSingle();
  if (!row) return { ok: false as const, error: "Testimonial not found." };

  const eligible = Boolean(row.consent_public) && Boolean((row.body as string).trim());
  const nextStatus = eligible ? "published" : "pending";

  const result = await runAdminAction({
    actor,
    action: "testimonial.unhide",
    target: { type: "testimonial", id },
    reason,
    before: { status: row.status },
    run: async () => {
      const update: Record<string, unknown> = { status: nextStatus };
      if (nextStatus === "published" && !row.published_at) {
        update.published_at = new Date().toISOString();
      }
      const { error } = await admin.from("testimonials").update(update).eq("id", id);
      if (error) throw new Error(error.message);
      return { result: nextStatus, after: { status: nextStatus } };
    },
  });

  if (result.ok) {
    revalidateTestimonials((row.companies as { slug?: string } | null)?.slug);
  }
  return result.ok
    ? {
        ok: true as const,
        status: result.result,
        note: eligible ? undefined : "Consent or body missing — left pending instead of publishing.",
      }
    : { ok: false as const, error: result.error };
}
