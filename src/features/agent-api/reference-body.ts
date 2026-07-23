/** Normalize reference create body — accepts common agent aliases. */
export type ReferenceCreateJson = {
  client_name?: string;
  client?: string;
  service?: string;
  started_year?: string;
  start_year?: string;
  ongoing?: boolean;
  ended_year?: string | null;
  invite_email?: string | null;
  website?: string | null;
};

export function normalizeReferenceCreateBody(body: ReferenceCreateJson) {
  return {
    clientName: String(body.client_name ?? body.client ?? "").trim(),
    service: String(body.service ?? "").trim(),
    startedYear: String(body.started_year ?? body.start_year ?? "").trim(),
    ongoing: body.ongoing !== false,
    endedYear: body.ended_year ?? null,
    inviteEmail: String(body.invite_email ?? "").trim().toLowerCase() || null,
    website: String(body.website ?? "").trim() || null,
  };
}

export const REFERENCE_REQUIRED_FIELDS =
  "client_name (or client), service, started_year (or start_year)";
