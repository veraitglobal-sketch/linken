import net from "node:net";

/**
 * Private / special-use addresses that must never be fetched from Hansala egress.
 * Used by domain verification and outbound webhooks (SSRF control).
 */
export function isPrivateOrSpecialIp(ip: string): boolean {
  const v = net.isIP(ip);
  if (v === 0) return true;

  if (v === 4) {
    if (ip === "0.0.0.0" || ip === "127.0.0.1") return true;
    if (ip.startsWith("10.")) return true;
    if (ip.startsWith("127.")) return true;
    if (ip.startsWith("169.254.")) return true;
    if (ip.startsWith("192.168.")) return true;
    if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)) return true;
    // CGNAT 100.64.0.0/10
    if (/^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(ip)) return true;
    // Documentation / benchmark
    if (ip.startsWith("192.0.2.") || ip.startsWith("198.51.100.")) return true;
    if (ip.startsWith("203.0.113.")) return true;
    return false;
  }

  const lower = ip.toLowerCase();
  if (lower === "::1" || lower === "::") return true;
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
  if (lower.startsWith("fe80")) return true;
  if (lower.startsWith("::ffff:")) {
    const mapped = lower.slice("::ffff:".length);
    if (net.isIP(mapped) === 4) return isPrivateOrSpecialIp(mapped);
  }
  return false;
}

const BLOCKED_HOSTS = new Set([
  "localhost",
  "metadata.google.internal",
  "metadata.google",
  "kubernetes.default",
  "kubernetes.default.svc",
]);

/** Hostname blocklist before DNS (metadata, localhost aliases). */
export function isBlockedHostname(hostname: string): boolean {
  const host = hostname.trim().toLowerCase().replace(/\.$/, "");
  if (!host) return true;
  if (BLOCKED_HOSTS.has(host)) return true;
  if (host.endsWith(".localhost") || host.endsWith(".local")) return true;
  if (host.endsWith(".internal")) return true;
  if (host === "metadata" || host.startsWith("metadata.")) return true;
  return false;
}
