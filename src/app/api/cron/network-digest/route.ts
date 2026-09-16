import type { NextRequest } from "next/server";
import { sendNetworkDigestAdmin } from "@/features/network/digest";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Weekly network digest for opted-in claimed companies. */
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
    .eq("claimed", true)
    .eq("network_digest_opt_in", true);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const ids = (data ?? []).map((row) => row.id as string);
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  const BATCH = 8;
  for (let i = 0; i < ids.length; i += BATCH) {
    const chunk = ids.slice(i, i + BATCH);
    const results = await Promise.all(chunk.map((id) => sendNetworkDigestAdmin(id)));
    for (const r of results) {
      if (r.ok && r.skipped) skipped += 1;
      else if (r.ok) sent += 1;
      else failed += 1;
    }
  }

  return Response.json({
    companies: ids.length,
    sent,
    skipped,
    failed,
    ms: Date.now() - started,
  });
}
