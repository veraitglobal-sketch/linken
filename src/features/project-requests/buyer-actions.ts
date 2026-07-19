"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { notifyMatchingCompanies } from "@/features/project-requests/notify";
import { sendProjectRequestManageEmail } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function createProjectRequest(formData: FormData) {
  const requesterName = String(formData.get("requester_name") ?? "").trim();
  const requesterEmail = String(formData.get("requester_email") ?? "")
    .trim()
    .toLowerCase();
  const requesterCompany = String(
    formData.get("requester_company") ?? "",
  ).trim();
  const category = String(formData.get("category") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const budgetHint = String(formData.get("budget_hint") ?? "").trim();
  const timeline = String(formData.get("timeline") ?? "").trim();
  const honeypot = String(formData.get("company_website") ?? "").trim();
  const backRaw = String(formData.get("back") ?? "").trim();
  const back =
    backRaw.startsWith("/") && !backRaw.startsWith("//")
      ? backRaw
      : "/requests/new";

  if (honeypot) redirect(`${back}?sent=1`);

  if (!requesterName || !isValidEmail(requesterEmail)) {
    redirect(
      `${back}?error=${encodeURIComponent("Name and a valid email are required.")}`,
    );
  }
  if (!category || !city) {
    redirect(
      `${back}?error=${encodeURIComponent("Category and city are required.")}`,
    );
  }
  if (title.length < 5 || description.length < 20) {
    redirect(
      `${back}?error=${encodeURIComponent("Add a clearer title and description.")}`,
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_project_request", {
    p_requester_name: requesterName,
    p_requester_email: requesterEmail,
    p_requester_company: requesterCompany,
    p_category: category,
    p_city: city,
    p_country: country,
    p_title: title,
    p_description: description,
    p_budget_hint: budgetHint,
    p_timeline: timeline,
  });

  if (error || !data?.[0]) {
    redirect(
      `${back}?error=${encodeURIComponent(error?.message ?? "Could not publish request.")}`,
    );
  }

  const row = data[0] as { request_id: string; manage_token: string };

  await sendProjectRequestManageEmail({
    to: requesterEmail,
    requesterName,
    title,
    manageToken: row.manage_token,
  });
  await notifyMatchingCompanies(row.request_id);

  redirect(`/requests/new?sent=1`);
}

export async function closeProjectRequest(formData: FormData) {
  const token = String(formData.get("manage_token") ?? "").trim();
  if (!token) redirect("/requests/new?error=Invalid%20link");

  const supabase = await createClient();
  const { error } = await supabase.rpc("close_project_request", {
    p_token: token,
  });

  if (error) {
    redirect(
      `/requests/manage/${token}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(`/requests/manage/${token}`);
  redirect(`/requests/manage/${token}?closed=1`);
}
