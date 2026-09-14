export function formatCertificateDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function partyPlace(party: {
  city: string;
  country: string;
}): string {
  return [party.city, party.country].filter(Boolean).join(", ");
}

export function partyHost(website: string): string {
  const raw = website.trim();
  if (!raw) return "";
  try {
    const host = new URL(raw.includes("://") ? raw : `https://${raw}`).hostname;
    return host.replace(/^www\./i, "");
  } catch {
    return "";
  }
}

export function displayRecordUrl(url: string): string {
  return url.replace(/^https?:\/\//i, "");
}

export function sharedWorkLabel(count: number): string | null {
  if (count === 1) return "1 shared case study";
  if (count > 1) return `${count} shared case studies`;
  return null;
}
