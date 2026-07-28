/** Comma-separated staff emails in PLATFORM_ADMIN_EMAILS. Fail closed if unset. */
export function getPlatformAdminEmails(): Set<string> {
  const raw = process.env.PLATFORM_ADMIN_EMAILS ?? "";
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isPlatformAdminEmail(email: string | null | undefined): boolean {
  if (!email?.trim()) return false;
  const allow = getPlatformAdminEmails();
  if (allow.size === 0) return false;
  return allow.has(email.trim().toLowerCase());
}
