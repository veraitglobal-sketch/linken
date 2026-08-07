import {
  ALLOWED_PROP_KEYS,
  FORBIDDEN_PROP_KEYS,
  type AnalyticsProps,
} from "@/features/product-analytics/properties";

const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/i;

function looksLikeEmail(value: unknown): boolean {
  return typeof value === "string" && EMAIL_RE.test(value);
}

/** Strip forbidden keys and any value that looks like an email. */
export function sanitizeAnalyticsProps(
  props: AnalyticsProps | Record<string, unknown> | null | undefined,
): AnalyticsProps {
  if (!props || typeof props !== "object") return {};
  const out: Record<string, unknown> = {};
  const allowed = new Set<string>(ALLOWED_PROP_KEYS);
  const forbidden = new Set<string>(FORBIDDEN_PROP_KEYS);

  for (const [key, value] of Object.entries(props)) {
    if (forbidden.has(key)) continue;
    if (!allowed.has(key)) continue;
    if (value == null) continue;
    if (looksLikeEmail(value)) continue;
    if (typeof value === "string") {
      const trimmed = value.trim().slice(0, 64);
      if (!trimmed || looksLikeEmail(trimmed)) continue;
      out[key] = trimmed;
      continue;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      out[key] = value;
      continue;
    }
    if (typeof value === "boolean") {
      out[key] = value;
    }
  }
  return out as AnalyticsProps;
}

export function containsSensitiveAnalyticsData(
  props: Record<string, unknown> | null | undefined,
): boolean {
  if (!props) return false;
  for (const [key, value] of Object.entries(props)) {
    if ((FORBIDDEN_PROP_KEYS as readonly string[]).includes(key)) return true;
    if (looksLikeEmail(value)) return true;
  }
  return false;
}
