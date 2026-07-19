"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendProjectResponseBuyerEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function respondToProjectRequest(formData: FormData) {
  const requestId = String(formData.get("request_id") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const backRaw = String(formData.get("back") ?? "").trim();
  const back =
    backRaw.startsWith("/") && !backRaw.startsWith("//")
      ? backRaw
      : "/dashboard/radar";

  if (!requestId || message.length < 20) {
    redirect(
      `${back}?error=${encodeURIComponent("Message must be at least 20 characters.")}`,
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);

  const { data, error } = await supabase.rpc("respond_to_request", {
    p_request_id: requestId,
    p_message: message,
  });

  if (error || !data?.[0]) {
    redirect(
      `${back}?error=${encodeURIComponent(error?.message ?? "Could not send response.")}`,
    );
  }

  const row = data[0] as { response_id: string };
  const admin = createAdminClient();
  if (admin) {
    const { data: notify } = await admin.rpc("get_response_buyer_notify", {
      p_response_id: row.response_id,
    });
    const n = notify?.[0] as
      | {
          requester_name: string;
          requester_email: string;
          request_title: string;
          manage_token: string;
          company_name: string;
          company_slug: string;
          message: string;
        }
      | undefined;

    if (n?.requester_email) {
      await sendProjectResponseBuyerEmail({
        to: n.requester_email,
        requesterName: n.requester_name,
        companyName: n.company_name,
        companySlug: n.company_slug,
        requestTitle: n.request_title,
        message: n.message,
        manageToken: n.manage_token,
      });
    }
  }

  revalidatePath("/dashboard/radar");
  redirect(`${back}?responded=1`);
}
