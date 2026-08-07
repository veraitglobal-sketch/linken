/** Lightweight structural checks — not a full schema.org validator. */

export type JsonLdIssue = { path: string; message: string };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function validateOrganizationLd(data: unknown): JsonLdIssue[] {
  const issues: JsonLdIssue[] = [];
  if (!isRecord(data)) {
    return [{ path: "", message: "expected object" }];
  }
  const types = Array.isArray(data["@type"])
    ? data["@type"]
    : [data["@type"]];
  if (!types.includes("Organization") && !types.includes("ProfessionalService")) {
    issues.push({ path: "@type", message: "missing Organization type" });
  }
  if (typeof data.name !== "string" || !data.name.trim()) {
    issues.push({ path: "name", message: "required" });
  }
  if (typeof data.url !== "string" || !data.url.startsWith("http")) {
    issues.push({ path: "url", message: "absolute url required" });
  }
  return issues;
}

export function validateBreadcrumbLd(data: unknown): JsonLdIssue[] {
  const issues: JsonLdIssue[] = [];
  if (!isRecord(data) || data["@type"] !== "BreadcrumbList") {
    return [{ path: "@type", message: "expected BreadcrumbList" }];
  }
  const items = data.itemListElement;
  if (!Array.isArray(items) || items.length < 2) {
    issues.push({ path: "itemListElement", message: "need ≥2 items" });
  }
  return issues;
}

export function validateArticleLd(data: unknown): JsonLdIssue[] {
  const issues: JsonLdIssue[] = [];
  if (!isRecord(data) || data["@type"] !== "Article") {
    return [{ path: "@type", message: "expected Article" }];
  }
  if (typeof data.headline !== "string" || !data.headline.trim()) {
    issues.push({ path: "headline", message: "required" });
  }
  if (!isRecord(data.author)) {
    issues.push({ path: "author", message: "required" });
  }
  return issues;
}

/** Reject non-schema custom keys that break rich-result parsers. */
export function hasForbiddenSchemaKeys(
  data: unknown,
  forbidden = ["client_confirmed", "pending", "claim_token"],
): boolean {
  if (!isRecord(data)) return false;
  return forbidden.some((k) => k in data);
}
