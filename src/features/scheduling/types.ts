export type SchedulingProvider = "calendly" | "calcom";

export type CompanyScheduling = {
  provider: SchedulingProvider | null;
  url: string | null;
  label: string;
};

export function emptyScheduling(): CompanyScheduling {
  return { provider: null, url: null, label: "Book a call" };
}

/** Detect provider from a public booking URL. */
export function detectSchedulingProvider(
  raw: string,
): SchedulingProvider | null {
  try {
    const host = new URL(raw.trim()).hostname.toLowerCase();
    if (host === "calendly.com" || host.endsWith(".calendly.com")) {
      return "calendly";
    }
    if (
      host === "cal.com" ||
      host.endsWith(".cal.com") ||
      host === "app.cal.com"
    ) {
      return "calcom";
    }
    return null;
  } catch {
    return null;
  }
}

export function normalizeSchedulingUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!detectSchedulingProvider(url.toString())) return null;
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function providerLabel(provider: SchedulingProvider): string {
  return provider === "calendly" ? "Calendly" : "Cal.com";
}
