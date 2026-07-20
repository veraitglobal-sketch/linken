/**
 * Shared service / capability suggestions for company settings.
 * Same list for every company — filter as the user types.
 */
export const SERVICE_SUGGESTIONS = [
  "IT services",
  "Software development",
  "Web development",
  "Mobile apps",
  "Cloud infrastructure",
  "Cybersecurity",
  "Data analytics",
  "AI & machine learning",
  "DevOps",
  "Managed IT",
  "Architecture",
  "Interior design",
  "Concept design",
  "Building permits",
  "Project oversight",
  "Construction",
  "Fit-out",
  "MEP engineering",
  "Structural engineering",
  "Civil engineering",
  "General contracting",
  "Facility management",
  "Property development",
  "Real estate advisory",
  "Legal services",
  "Accounting",
  "Tax advisory",
  "Consulting",
  "Strategy consulting",
  "Management consulting",
  "HR consulting",
  "Recruitment",
  "Marketing",
  "Branding",
  "Digital marketing",
  "SEO",
  "Content production",
  "PR & communications",
  "Design",
  "Product design",
  "UX/UI design",
  "Graphic design",
  "Photography",
  "Video production",
  "Logistics",
  "Supply chain",
  "Manufacturing",
  "Healthcare",
  "Education",
  "Hospitality",
  "Retail",
  "E-commerce",
  "Finance",
  "Insurance",
  "Sustainability",
  "ESG advisory",
  "Energy",
  "Renewables",
  "Telecommunications",
  "Media",
  "Events",
  "Training",
  "Customer support",
  "Sales enablement",
  "Partnerships",
] as const;

export function filterServiceSuggestions(
  query: string,
  exclude: string[],
  limit = 8,
): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const taken = new Set(exclude.map((s) => s.toLowerCase()));
  return SERVICE_SUGGESTIONS.filter((s) => {
    const lower = s.toLowerCase();
    if (taken.has(lower)) return false;
    return lower.includes(q) || lower.split(/\s+/).some((w) => w.startsWith(q));
  }).slice(0, limit);
}
