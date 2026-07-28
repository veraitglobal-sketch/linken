import type {
  ApiCaseStudy,
  ApiReference,
  ApiTestimonial,
} from "@/features/public-api/v1/types";
import type { Partner } from "@/types/partner";

export function linesForReferences(
  refs: ApiReference[],
  siteUrl: string,
): string[] {
  if (refs.length === 0) return [];
  const lines = [`## Confirmed clients (${refs.length})`];
  for (const r of refs) {
    const client = r.client_slug
      ? `[${r.client_name}](${siteUrl}/c/${r.client_slug})`
      : r.client_name;
    const period = r.ongoing
      ? `${r.started_year || "?"}–present (ongoing)`
      : `${r.started_year || "?"}${r.ended_year ? `–${r.ended_year}` : ""}`;
    lines.push(`- ${client} · ${r.service} · ${period}`);
  }
  lines.push("");
  return lines;
}

export function linesForPartners(
  partners: Partner[],
  siteUrl: string,
): string[] {
  if (partners.length === 0) return [];
  const lines = [`## Confirmed partners (${partners.length})`];
  for (const p of partners) {
    lines.push(`- [${p.name}](${siteUrl}/c/${p.slug})`);
  }
  lines.push("");
  return lines;
}

export function linesForCaseStudies(cases: ApiCaseStudy[]): string[] {
  if (cases.length === 0) return [];
  const lines = [`## Case studies (${cases.length}, confirmed only)`];
  for (const c of cases) {
    const summary = c.summary.trim()
      ? c.summary.trim().replace(/\s+/g, " ")
      : "—";
    const oneLine =
      summary.length > 160 ? `${summary.slice(0, 157)}…` : summary;
    lines.push(
      `- [${c.title}](${c.url})${c.year ? ` · ${c.year}` : ""} — ${oneLine}`,
    );
  }
  lines.push("");
  return lines;
}

export function linesForTestimonials(
  testimonials: ApiTestimonial[],
  siteUrl: string,
): string[] {
  if (testimonials.length === 0) return [];
  const lines = [
    `## Testimonials (${testimonials.length}, client-written)`,
  ];
  for (const t of testimonials) {
    const body = t.body.trim().replace(/\s+/g, " ");
    const quote = body.length > 220 ? `${body.slice(0, 217)}…` : body;
    const who = [t.author_name, t.author_role].filter(Boolean).join(", ");
    const firm = t.author_company
      ? ` · [${t.author_company.name}](${siteUrl}/c/${t.author_company.slug})`
      : "";
    lines.push(`- “${quote}” — ${who || "Client"}${firm} (${t.provenance_line})`);
  }
  lines.push("");
  return lines;
}
