"use server";

import { revalidatePath } from "next/cache";
import { deleteCompanySlack } from "@/features/slack/queries";
import { getOwnedActiveCompany } from "@/features/workspace/require-owned";

export async function disconnectSlackAction(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const ctx = await getOwnedActiveCompany();
  if (!ctx.user || !ctx.company) {
    return { ok: false, error: "Sign in as a company owner." };
  }

  const result = await deleteCompanySlack(ctx.company.id);
  if (!result.ok) return result;

  revalidatePath("/dashboard/integrations");
  return { ok: true };
}
