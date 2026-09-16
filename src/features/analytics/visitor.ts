import { createHash } from "node:crypto";

const BOT =
  /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandex|facebookexternalhit|twitterbot|linkedinbot|slackbot|discordbot|whatsapp|telegrambot|applebot|semrush|ahrefs|mj12bot|dotbot|gptbot|claudebot|chatgpt|bytespider|amazonbot|petalbot|preview/i;

const SOURCE_ALIASES: Record<string, string> = {
  ranking: "search",
  "partner-badge": "partner",
  testimonial: "partner",
  testimonial_api: "partner",
};

export function isAnalyticsBot(userAgent: string | null | undefined): boolean {
  const ua = (userAgent ?? "").trim();
  if (!ua) return false;
  return BOT.test(ua);
}

export function isPrefetchRequest(headers: Headers): boolean {
  const purpose = `${headers.get("purpose") ?? ""} ${headers.get("sec-purpose") ?? ""}`.toLowerCase();
  if (purpose.includes("prefetch")) return true;
  const next = headers.get("next-router-prefetch");
  return next === "1" || next === "true";
}

export function visitorHash(ip: string, userAgent: string, salt: string): string {
  return createHash("sha256")
    .update(`${ip.trim()}\n${userAgent.trim()}\n${salt}`)
    .digest("hex")
    .slice(0, 32);
}

export function aliasProfileSource(raw: string): string {
  return SOURCE_ALIASES[raw] ?? raw;
}
