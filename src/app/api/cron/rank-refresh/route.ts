import type { NextRequest } from "next/server";
import { refreshCompanyRank } from "@/features/ranking/refresh";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Recompute every company's ranking.
 *
 * Two jobs in one: the first run after the ranking tables land, and the daily
 * pass that lets old confirmations lose weight without a new event happening.
 * Events keep individual companies fresh in between.
 *
 * Protected by `RANK_CRON_SECRET` — sent as `Authorization: Bearer …` (Vercel
 * Cron) or `x-cron-secret`. Without the secret set, the route stays closed.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.RANK_CRON_SECRET?.trim();
  if (!secret) {
    return Response.json(
      { error: "RANK_CRON_SECRET is not configured." },
      { status: 503 },
    );
  }

  const header =
    request.headers.get("x-cron-secret")?.trim() ||
    /^Bearer\s+(\S+)$/i.exec(request.headers.get("authorization") ?? "")?.[1];
  if (header !== secret) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return Response.json({ error: "Service role is not configured." }, { status: 503 });
  }

  const started = Date.now();
  const { data, error } = await admin
    .from("companies")
    .select("id")
    .eq("claimed", true);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const ids = (data ?? []).map((row) => row.id as string);
  // Small batches: a recompute is several reads per company.
  const BATCH = 10;
  for (let i = 0; i < ids.length; i += BATCH) {
    await Promise.all(ids.slice(i, i + BATCH).map((id) => refreshCompanyRank(id)));
  }

  return Response.json({
    companies: ids.length,
    ms: Date.now() - started,
  });
}
