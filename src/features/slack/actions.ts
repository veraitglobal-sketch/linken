"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  decodeSlackPending,
  SLACK_PENDING_COOKIE,
} from "@/features/slack/pending-cookie";
import {
  deleteCompanySlack,
  upsertCompanySlack,
} from "@/features/slack/queries";
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

/** Bind Marketplace OAuth cookie to the active company after login. */
export async function completeSlackPendingAction(): Promise<
  { ok: true } | { ok: false; error: string } | { ok: false; skip: true }
> {
  const jar = await cookies();
  const raw = jar.get(SLACK_PENDING_COOKIE)?.value;
  if (!raw) return { ok: false, skip: true };

  const pending = decodeSlackPending(raw);
  jar.set(SLACK_PENDING_COOKIE, "", { path: "/", maxAge: 0 });
  if (!pending) {
    return { ok: false, error: "Slack install expired. Connect again." };
  }

  const ctx = await getOwnedActiveCompany();
  if (!ctx.user || !ctx.company) {
    return { ok: false, error: "Sign in as a company owner." };
  }

  const saved = await upsertCompanySlack({
    companyId: ctx.company.id,
    userId: ctx.user.id,
    teamId: pending.teamId,
    teamName: pending.teamName,
    channelId: pending.channelId,
    channelName: pending.channelName,
    webhookUrl: pending.webhookUrl,
    botToken: pending.botToken,
    slackUserId: pending.slackUserId,
  });
  if (!saved.ok) return saved;

  revalidatePath("/dashboard/integrations");
  return { ok: true };
}
