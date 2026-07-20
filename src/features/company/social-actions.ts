"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOperatorActiveCompany } from "@/features/workspace/require-operator";

function normalizeSocialUrl(
  raw: string,
  hostIncludes: string[],
): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  if (!hostIncludes.some((h) => host === h || host.endsWith(`.${h}`))) {
    return null;
  }
  return url.toString();
}

export async function updateSocialLinks(formData: FormData) {
  const linkedinRaw = String(formData.get("linkedin_url") ?? "");
  const facebookRaw = String(formData.get("facebook_url") ?? "");

  const linkedin =
    linkedinRaw.trim() === ""
      ? null
      : normalizeSocialUrl(linkedinRaw, ["linkedin.com"]);
  const facebook =
    facebookRaw.trim() === ""
      ? null
      : normalizeSocialUrl(facebookRaw, ["facebook.com", "fb.com"]);

  if (linkedinRaw.trim() && !linkedin) {
    redirect(
      `/dashboard/verification?error=${encodeURIComponent("LinkedIn URL must be a linkedin.com link.")}`,
    );
  }
  if (facebookRaw.trim() && !facebook) {
    redirect(
      `/dashboard/verification?error=${encodeURIComponent("Facebook URL must be a facebook.com link.")}`,
    );
  }

  const { supabase, company } = await requireOperatorActiveCompany({
    loginNext: "/dashboard/verification",
  });

  const { error } = await supabase
    .from("companies")
    .update({ linkedin_url: linkedin, facebook_url: facebook })
    .eq("id", company.id);

  if (error) {
    redirect(
      `/dashboard/verification?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/dashboard");
  revalidatePath(`/c/${company.slug}`);
  redirect("/dashboard/verification?socialSaved=1");
}
