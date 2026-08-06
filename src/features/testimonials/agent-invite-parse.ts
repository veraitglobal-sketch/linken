/** Parse + validate Agent POST /testimonials/invite body. */

const SOURCES = ["standalone", "reference", "case_study", "partnership"] as const;
export type InviteSource = (typeof SOURCES)[number];

export type ParsedInviteBody =
  | {
      ok: true;
      email: string;
      source: InviteSource;
      sourceId: string | null;
      authorCompanyId: string | null;
      sendEmail: boolean;
    }
  | { ok: false; error: string };

export function parseInviteBody(raw: Record<string, unknown>): ParsedInviteBody {
  const email = String(raw.author_email ?? "")
    .trim()
    .toLowerCase();
  if (!email.includes("@")) {
    return { ok: false, error: "author_email is required." };
  }

  const source = String(raw.source ?? "standalone");
  if (!(SOURCES as readonly string[]).includes(source)) {
    return { ok: false, error: "Invalid source." };
  }

  return {
    ok: true,
    email,
    source: source as InviteSource,
    sourceId: raw.source_id ? String(raw.source_id) : null,
    authorCompanyId: raw.author_company_id
      ? String(raw.author_company_id)
      : null,
    sendEmail: raw.send_email !== false,
  };
}

export function inviteLimitBody() {
  return {
    error: {
      code: "rate_limited",
      message: "Invite limit exceeded (20 invites/day per key).",
    },
  };
}
