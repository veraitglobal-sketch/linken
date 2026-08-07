import dns from "node:dns/promises";
import net from "node:net";
import {
  isBlockedHostname,
  isPrivateOrSpecialIp,
} from "@/features/security/private-ip";

/**
 * Resolve hostname and reject private / special-use addresses.
 * Call again after every redirect. Does not eliminate DNS rebinding alone —
 * prefer redirect: "error" on webhook delivery.
 */
export async function assertPublicHostname(hostname: string): Promise<void> {
  if (isBlockedHostname(hostname)) {
    throw new Error("Host is not allowed.");
  }
  if (net.isIP(hostname)) {
    if (isPrivateOrSpecialIp(hostname)) {
      throw new Error("Host resolves to a private network address.");
    }
    return;
  }
  const results = await dns.lookup(hostname, { all: true, verbatim: true });
  if (results.length === 0) {
    throw new Error("Domain did not resolve.");
  }
  for (const r of results) {
    if (net.isIP(r.address) === 0) continue;
    if (isPrivateOrSpecialIp(r.address)) {
      throw new Error("Domain resolves to a private network address.");
    }
  }
}
