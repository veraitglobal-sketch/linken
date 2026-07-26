import "server-only";

import {
  collectManifestHref,
  contentTypeForExt,
  extFromContentType,
  parseManifestIconUrls,
  pickBestIcon,
} from "@/features/logo/logo-discover";
import { extractDomain } from "@/features/verification/domain";
import {
  fetchCompanyBinary,
  fetchCompanySite,
} from "@/features/verification/safe-fetch";

/** Ordered logo candidates (JSON-LD → apple → manifest → og → favicon last). */
export async function discoverLogoCandidatesForWebsite(
  website: string,
): Promise<{ ok: true; candidates: string[] } | { ok: false; error: string }> {
  const domain = extractDomain(website);
  if (!domain) return { ok: false, error: "No valid website domain." };

  const home = await fetchCompanySite(domain, "/");
  if (!home.ok) return { ok: false, error: home.error };

  let manifestIcons: string[] = [];
  const manifestHref = collectManifestHref(home.body, home.finalUrl);
  if (manifestHref) {
    try {
      const manHost = extractDomain(new URL(manifestHref).hostname);
      if (manHost === domain) {
        const man = await fetchCompanyBinary(domain, manifestHref, {
          maxBytes: 256 * 1024,
          timeoutMs: 6_000,
        });
        if (man.ok) {
          const text = new TextDecoder("utf-8", { fatal: false }).decode(
            man.body,
          );
          manifestIcons = parseManifestIconUrls(text, man.finalUrl);
        }
      }
    } catch {
      /* skip manifest */
    }
  }

  return {
    ok: true,
    candidates: pickBestIcon(home.body, home.finalUrl, domain, manifestIcons),
  };
}

/** Download a candidate URL via SSRF-safe fetch (host must be public HTTPS). */
export async function downloadLogoCandidate(
  candidateUrl: string,
): Promise<
  | { ok: true; image: ArrayBuffer; ext: string; uploadType: string }
  | { ok: false; error: string }
> {
  let host: string;
  try {
    const u = new URL(candidateUrl);
    if (u.protocol !== "https:") {
      return { ok: false, error: "Only HTTPS candidates are allowed." };
    }
    host = extractDomain(u.hostname) ?? u.hostname;
  } catch {
    return { ok: false, error: "Invalid candidate URL." };
  }

  const bin = await fetchCompanyBinary(host, candidateUrl, {
    maxBytes: 1024 * 1024,
    timeoutMs: 8_000,
  });
  if (!bin.ok) return { ok: false, error: bin.error };

  const looksIco = candidateUrl.toLowerCase().includes(".ico");
  if (
    bin.contentType &&
    !bin.contentType.startsWith("image/") &&
    !looksIco
  ) {
    return { ok: false, error: "Candidate is not an image." };
  }
  const contentType =
    bin.contentType || (looksIco ? "image/x-icon" : "image/png");
  const ext = extFromContentType(contentType, bin.finalUrl);
  const uploadType = contentType.startsWith("image/")
    ? contentType
    : contentTypeForExt(ext);
  return { ok: true, image: bin.body, ext, uploadType };
}
