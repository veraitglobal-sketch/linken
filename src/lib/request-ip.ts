import { headers } from "next/headers";
import { createHash } from "node:crypto";

export function hashClientIp(raw: string): string {
  return createHash("sha256").update(raw.trim()).digest("hex");
}

export async function getRequestIpHash(): Promise<string | null> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const ip = (forwarded?.split(",")[0] ?? h.get("x-real-ip") ?? "").trim();
  if (!ip) return null;
  return hashClientIp(ip);
}
