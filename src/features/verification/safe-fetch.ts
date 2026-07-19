import dns from "node:dns/promises";
import net from "node:net";
import { extractDomain } from "@/features/verification/domain";

const MAX_BYTES = 500 * 1024;
const TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 3;

function isPrivateIp(ip: string): boolean {
  if (ip === "127.0.0.1" || ip === "::1") return true;
  if (ip.startsWith("10.")) return true;
  if (ip.startsWith("169.254.")) return true;
  if (ip.startsWith("192.168.")) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)) return true;
  if (ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80")) return true;
  return false;
}

async function assertPublicHost(hostname: string) {
  const results = await dns.lookup(hostname, { all: true, verbatim: true });
  if (results.length === 0) {
    throw new Error("Domain did not resolve.");
  }
  for (const r of results) {
    if (net.isIP(r.address) === 0) continue;
    if (isPrivateIp(r.address)) {
      throw new Error("Domain resolves to a private network address.");
    }
  }
}

/**
 * Fetch https://{expectedDomain}{path} with SSRF guards.
 * expectedDomain must already be extractDomain(company.website).
 */
export async function fetchCompanySite(
  expectedDomain: string,
  path = "/",
): Promise<{ ok: true; body: string; finalUrl: string } | { ok: false; error: string }> {
  const domain = extractDomain(expectedDomain) ?? expectedDomain.toLowerCase();
  if (!domain) return { ok: false, error: "Invalid domain." };

  let url = `https://${domain}${path.startsWith("/") ? path : `/${path}`}`;

  try {
    for (let i = 0; i <= MAX_REDIRECTS; i++) {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:") {
        return { ok: false, error: "Only HTTPS is allowed." };
      }

      const host = extractDomain(parsed.hostname) ?? parsed.hostname.replace(/^www\./, "");
      if (host !== domain) {
        return { ok: false, error: "Redirect left the company domain." };
      }

      await assertPublicHost(parsed.hostname);

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      let res: Response;
      try {
        res = await fetch(url, {
          method: "GET",
          redirect: "manual",
          signal: controller.signal,
          headers: {
            "User-Agent": "LinkenDomainVerify/1.0",
            Accept: "text/html,text/plain,*/*",
          },
        });
      } finally {
        clearTimeout(timer);
      }

      if ([301, 302, 303, 307, 308].includes(res.status)) {
        const loc = res.headers.get("location");
        if (!loc) return { ok: false, error: "Redirect without location." };
        url = new URL(loc, url).toString();
        if (i === MAX_REDIRECTS) {
          return { ok: false, error: "Too many redirects." };
        }
        continue;
      }

      if (!res.ok) {
        return { ok: false, error: `HTTP ${res.status}` };
      }

      const buf = await res.arrayBuffer();
      if (buf.byteLength > MAX_BYTES) {
        return { ok: false, error: "Response exceeds 500KB limit." };
      }
      const body = new TextDecoder("utf-8", { fatal: false }).decode(buf);
      return { ok: true, body, finalUrl: url };
    }

    return { ok: false, error: "Too many redirects." };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Fetch failed.";
    return { ok: false, error: message };
  }
}

export async function resolveTxtRecords(domain: string): Promise<string[]> {
  const host = extractDomain(domain) ?? domain;
  await assertPublicHost(host);
  const records = await dns.resolveTxt(host);
  return records.map((chunks) => chunks.join(""));
}
