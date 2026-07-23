import type { CaseStudyMetric } from "@/types/case-study";

export function parseMetricsFromForm(formData: FormData): CaseStudyMetric[] {
  const out: CaseStudyMetric[] = [];
  for (let i = 1; i <= 3; i++) {
    const label = String(formData.get(`metric_${i}_label`) ?? "").trim();
    const value = String(formData.get(`metric_${i}_value`) ?? "").trim();
    if (label && value) out.push({ label, value });
  }
  return out;
}

export function normalizeMetrics(raw: unknown): CaseStudyMetric[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const label = String((row as CaseStudyMetric).label ?? "").trim();
      const value = String((row as CaseStudyMetric).value ?? "").trim();
      if (!label || !value) return null;
      return { label, value };
    })
    .filter((m): m is CaseStudyMetric => m !== null)
    .slice(0, 3);
}
