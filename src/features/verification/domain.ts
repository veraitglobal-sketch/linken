/** Pure domain helpers — no I/O. Exact match or www-variant only. */

const PUBLIC_EMAIL_PROVIDERS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.de",
  "yahoo.co.uk",
  "yahoo.fr",
  "hotmail.com",
  "hotmail.de",
  "outlook.com",
  "outlook.de",
  "live.com",
  "msn.com",
  "web.de",
  "gmx.de",
  "gmx.net",
  "gmx.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "pm.me",
  "mail.com",
  "yandex.com",
  "yandex.ru",
  "zoho.com",
  "tutanota.com",
  "fastmail.com",
]);

const IPV4 =
  /^(?:\d{1,3}\.){3}\d{1,3}$/;

export function isPublicEmailProvider(domain: string): boolean {
  const d = domain.toLowerCase();
  if (PUBLIC_EMAIL_PROVIDERS.has(d)) return true;
  // yahoo.*, gmx.*, hotmail.* wildcards
  if (d.startsWith("yahoo.")) return true;
  if (d.startsWith("gmx.")) return true;
  if (d.startsWith("hotmail.")) return true;
  if (d.startsWith("outlook.")) return true;
  return false;
}

/**
 * Normalize a website URL or host to a registrable-ish hostname for matching.
 * Strips protocol, path, port, trailing dots, and leading www.
 * Rejects IPs and localhost → returns null.
 */
export function extractDomain(website: string): string | null {
  const raw = website.trim().toLowerCase();
  if (!raw) return null;

  let host = raw;
  try {
    if (host.includes("://")) {
      host = new URL(host).hostname;
    } else {
      // bare host or host/path
      host = host.split("/")[0] ?? "";
      host = host.split("?")[0] ?? "";
      host = host.split("#")[0] ?? "";
    }
  } catch {
    return null;
  }

  host = host.replace(/\.$/, "");
  if (host.startsWith("www.")) host = host.slice(4);

  // strip port if still present
  if (host.includes(":") && !host.startsWith("[")) {
    host = host.split(":")[0] ?? "";
  }

  if (!host || host === "localhost" || host.endsWith(".localhost")) return null;
  if (IPV4.test(host)) return null;
  if (host.includes(":")) return null; // ipv6 / residual port
  // Labels + dots; punycode (xn--) allowed as-is
  if (!/^([a-z0-9-]+\.)+[a-z0-9-]+$/.test(host)) return null;

  return host;
}

export function emailDomain(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at < 1 || at === trimmed.length - 1) return null;
  const domain = trimmed.slice(at + 1).replace(/\.$/, "");
  if (!domain || domain === "localhost" || IPV4.test(domain)) return null;
  return domain;
}

/** Exact match, or www.X vs X already normalized away by extractDomain. */
export function domainsMatch(
  website: string,
  email: string,
): { ok: boolean; websiteDomain: string | null; emailDomain: string | null; reason?: string } {
  const site = extractDomain(website);
  const mail = emailDomain(email);

  if (!site) {
    return { ok: false, websiteDomain: site, emailDomain: mail, reason: "Invalid website domain." };
  }
  if (!mail) {
    return { ok: false, websiteDomain: site, emailDomain: mail, reason: "Invalid email domain." };
  }
  if (isPublicEmailProvider(mail)) {
    return {
      ok: false,
      websiteDomain: site,
      emailDomain: mail,
      reason: "Public email providers cannot verify a company domain.",
    };
  }
  if (site !== mail) {
    return {
      ok: false,
      websiteDomain: site,
      emailDomain: mail,
      reason: `Email domain (${mail}) does not match website domain (${site}).`,
    };
  }
  return { ok: true, websiteDomain: site, emailDomain: mail };
}
