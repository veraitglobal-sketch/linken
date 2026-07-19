"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendOwnershipTransferEmail } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";

export async function requestOwnershipTransfer(formData: FormData) {
  const companyId = String(formData.get("company_id") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const back = "/dashboard";

  if (!companyId || !email) {
    redirect(`${back}?error=${encodeURIComponent("Email is required.")}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, slug")
    .eq("id", companyId)
    .eq("owner_id", user.id)
    .eq("claimed", true)
    .maybeSingle();

  if (!company) {
    redirect(`${back}?error=${encodeURIComponent("Only the owner can transfer.")}`);
  }

  const { data: token, error } = await supabase.rpc("create_ownership_transfer", {
    p_company_id: company.id,
    p_invite_email: email,
  });

  if (error || !token) {
    redirect(
      `${back}?error=${encodeURIComponent(error?.message ?? "Could not start transfer.")}`,
    );
  }

  await sendOwnershipTransferEmail({
    to: email,
    companyName: company.name,
    token: token as string,
  });

  revalidatePath(back);
  redirect(`${back}?transferSent=1`);
}

export async function cancelOwnershipTransfer(formData: FormData) {
  const companyId = String(formData.get("company_id") ?? "").trim();
  const back = "/dashboard";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);

  const { error } = await supabase.rpc("cancel_ownership_transfer", {
    p_company_id: companyId,
  });

  if (error) {
    redirect(`${back}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(back);
  redirect(`${back}?transferCancelled=1`);
}

export async function acceptOwnershipTransfer(formData: FormData) {
  const token = String(formData.get("token") ?? "").trim();
  const path = `/transfer/${token}`;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(path)}`);

  const { data, error } = await supabase.rpc("accept_ownership_transfer", {
    p_token: token,
  });

  if (error) {
    redirect(`${path}?error=${encodeURIComponent(error.message)}`);
  }

  const company = Array.isArray(data) ? data[0] : data;
  const slug = (company?.slug as string | undefined) ?? "";

  revalidatePath("/dashboard");
  if (slug) {
    revalidatePath(`/c/${slug}`);
    redirect(`/c/${slug}?ownershipTransferred=1`);
  }
  redirect("/dashboard?ownershipTransferred=1");
}
