import { serializeReference } from "@/features/public-api/v1/serializers";
import { csvLine } from "@/features/export/csv";
import type { ServiceReference } from "@/types/service-reference";

const HEADER =
  "id,client_name,client_slug,service,started_year,ongoing,ended_year,confirmed_at,confirmation_level,disclosure";

/** Confirmed client references — same fields as GET /api/v1/companies/{slug}/references. */
export function buildConfirmedReferencesCsv(refs: ServiceReference[]): string {
  const lines = [HEADER];
  for (const ref of refs) {
    const row = serializeReference(ref);
    if (!row) continue;
    lines.push(
      csvLine([
        row.id,
        row.client_name,
        row.client_slug ?? "",
        row.service,
        row.started_year,
        row.ongoing,
        row.ended_year,
        row.confirmed_at,
        row.confirmation_level,
        row.disclosure,
      ]),
    );
  }
  return lines.length > 1 ? `${lines.join("\n")}\n` : "";
}
