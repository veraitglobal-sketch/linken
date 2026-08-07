/** Mask secrets in logs — never print full tokens or URLs with tokens. */
export function maskSecret(value: string, keep = 4): string {
  const s = value.trim();
  if (s.length <= keep * 2) return "***";
  return `${s.slice(0, keep)}…${s.slice(-keep)}`;
}

export function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at < 1) return "***";
  const user = email.slice(0, at);
  const domain = email.slice(at + 1);
  const shown = user.slice(0, Math.min(2, user.length));
  return `${shown}***@${domain}`;
}

/** Strip query/path tokens from URLs before logging. */
export function maskUrlForLog(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(
      /\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi,
      "/[token]",
    );
    return `${u.origin}${path}`;
  } catch {
    return "[url]";
  }
}
