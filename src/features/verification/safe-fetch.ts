import dns from "node:dns/promises";
import net from "node:net";
import { extractDomain } from "@/features/verification/domain";

const DEFAULT_MAX_BYTES = 500 * 1024;
const DEFAULT_TIMEOUT_MS = 10_000;
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

type FetchOk = {
  ok: true;
  body: ArrayBuffer;
  contentType: string;
  finalUrl: string;
};

type FetchFail = { ok: false; error: string };

/**
 * Fetch a URL on the company domain with SSRF guards:
 * https only, host must stay on expectedDomain, private IPs blocked, max 3 redirects.
 */
export async function fetchCompanyResource(
  expectedDomain: string,
  pathOrUrl: string,
  options?: {
    maxBytes?: number;
    timeoutMs?: number;
    accept?: string;
    userAgent?: string;
  },
): Promise<FetchOk | FetchFail> {
  const domain = extractDomain(expectedDomain) ?? expectedDomain.toLowerCase();
  if (!domain) return { ok: false, error: "Invalid domain." };

  const maxBytes = options?.maxBytes ?? DEFAULT_MAX_BYTES;
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const accept = options?.accept ?? "text/html,text/plain,*/*";
  const userAgent = options?.userAgent ?? "HansalaDomainVerify/1.0";

  let url: string;
  try {
    if (pathOrUrl.startsWith("https://") || pathOrUrl.startsWith("http://")) {
      url = pathOrUrl;
    } else {
      const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
      url = `https://${domain}${path}`;
    }
  } catch {
    return { ok: false, error: "Invalid URL." };
  }

  try {
    for (let i = 0; i <= MAX_REDIRECTS; i++) {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:") {
        return { ok: false, error: "Only HTTPS is allowed." };
      }

      const host =
        extractDomain(parsed.hostname) ??
        parsed.hostname.replace(/^www\./, "");
      if (host !== domain) {
        return { ok: false, error: "Redirect left the company domain." };
      }

      await assertPublicHost(parsed.hostname);

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      let res: Response;
      try {
        res = await fetch(url, {
          method: "GET",
          redirect: "manual",
          signal: controller.signal,
          headers: {
            "User-Agent": userAgent,
            Accept: accept,
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
      if (buf.byteLength > maxBytes) {
        return {
          ok: false,
          error: `Response exceeds ${Math.round(maxBytes / 1024)}KB limit.`,
        };
      }

      const contentType = (res.headers.get("content-type") ?? "")
        .split(";")[0]
        ?.trim()
        .toLowerCase() ?? "";

      return { ok: true, body: buf, contentType, finalUrl: url };
    }

    return { ok: false, error: "Too many redirects." };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Fetch failed.";
    return { ok: false, error: message };
  }
}

/**
 * Fetch https://{expectedDomain}{path} as UTF-8 text (domain verification).
 */
export async function fetchCompanySite(
  expectedDomain: string,
  path = "/",
): Promise<{ ok: true; body: string; finalUrl: string } | { ok: false; error: string }> {
  const result = await fetchCompanyResource(expectedDomain, path, {
    maxBytes: DEFAULT_MAX_BYTES,
    timeoutMs: DEFAULT_TIMEOUT_MS,
    accept: "text/html,text/plain,*/*",
    userAgent: "HansalaDomainVerify/1.0",
  });
  if (!result.ok) return result;
  const body = new TextDecoder("utf-8", { fatal: false }).decode(result.body);
  return { ok: true, body, finalUrl: result.finalUrl };
}

/** Binary fetch for favicons / logos — same SSRF guard. */
export async function fetchCompanyBinary(
  expectedDomain: string,
  pathOrUrl: string,
  options?: { maxBytes?: number; timeoutMs?: number },
): Promise<
  | { ok: true; body: ArrayBuffer; contentType: string; finalUrl: string }
  | { ok: false; error: string }
> {
  return fetchCompanyResource(expectedDomain, pathOrUrl, {
    maxBytes: options?.maxBytes ?? 1024 * 1024,
    timeoutMs: options?.timeoutMs ?? 8_000,
    accept: "image/*,*/*",
    userAgent: "HansalaLogoFetch/1.0",
  });
}

export async function resolveTxtRecords(domain: string): Promise<string[]> {
  const host = extractDomain(domain) ?? domain;
  await assertPublicHost(host);
  const records = await dns.resolveTxt(host);
  return records.map((chunks) => chunks.join(""));
}
