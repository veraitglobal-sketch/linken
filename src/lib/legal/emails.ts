import { getLegalCompany } from "@/lib/legal/company";

export function mailto(email: string, subject?: string): string {
  const base = `mailto:${email}`;
  if (!subject) return base;
  return `${base}?subject=${encodeURIComponent(subject)}`;
}

export function contactMailto(subject?: string) {
  return mailto(getLegalCompany().contactEmail, subject);
}

export function privacyMailto(subject?: string) {
  return mailto(getLegalCompany().privacyEmail, subject);
}

export function securityMailto(subject?: string) {
  return mailto(getLegalCompany().securityEmail, subject);
}
