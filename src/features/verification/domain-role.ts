export const ROLE_EMAIL_LOCALS = [
  "admin",
  "administrator",
  "webmaster",
  "hostmaster",
  "postmaster",
  "info",
  "kontakt",
  "contact",
  "office",
  "hello",
] as const;

const ROLE_SET = new Set<string>(ROLE_EMAIL_LOCALS);

export function emailLocalPart(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at < 1) return null;
  return trimmed.slice(0, at);
}

export function isRoleEmailAddress(email: string): boolean {
  const local = emailLocalPart(email);
  return local != null && ROLE_SET.has(local);
}

/** Personal-looking local parts default hidden in the picker UI. */
export function isPersonalLookingEmail(email: string): boolean {
  const local = emailLocalPart(email);
  if (!local || isRoleEmailAddress(email)) return false;
  return /^[a-z][a-z0-9]*([._-][a-z][a-z0-9]+)+$/i.test(local);
}
