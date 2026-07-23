import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ensureCaseStudyRow } from "@/features/case-studies/ensure-case-study";
import { sendClientConfirmationEmail } from "@/lib/email";
import { toSlug } from "@/lib/slug";
import type { CaseStudyMetric } from "@/types/case-study";

export type CoreFail = { ok: false; error: string };
export type CoreOk<T> = { ok: true; data: T };
export type CoreResult<T> = CoreOk<T> | CoreFail;

async function uniqueCaseSlug(
  supabase: SupabaseClient,
  companyId: string,
  title: string,
) {
  const base = toSlug(title) || "case-study";
  let slug = base;
  let n = 0;
  while (n < 50) {
    const { data } = await supabase
      .from("case_studies")
      .select("id")
      .eq("company_id", companyId)
      .eq("slug", slug)
      .maybeSingle();
    if (!data) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export type CreateCaseStudyInput = {
  companyId: string;
  title: string;
  summary: string;
  challenge?: string;
  outcome?: string;
  process?: string;
  location?: string;
  year?: string;
  duration?: string;
  sector?: string;
  scope?: string;
  clientLabel?: string;
  highlightStat?: string;
  clientQuote?: string;
  metrics?: CaseStudyMetric[];
  services?: string[];
};

export async function createCaseStudyCore(
  supabase: SupabaseClient,
  input: CreateCaseStudyInput,
): Promise<CoreResult<{ id: string; slug: string }>> {
  const title = input.title.trim();
  const summary = input.summary.trim();
  if (!title || !summary) {
    return { ok: false, error: "title and summary are required." };
  }

  const slug = await uniqueCaseSlug(supabase, input.companyId, title);
  const row = {
    company_id: input.companyId,
    title,
    slug,
    summary,
    challenge: (input.challenge ?? "").trim(),
    outcome: (input.outcome ?? "").trim(),
    process: (input.process ?? "").trim(),
    location: (input.location ?? "").trim(),
    year: (input.year ?? "").trim() || new Date().getFullYear().toString(),
    duration: (input.duration ?? "").trim(),
    sector: (input.sector ?? "").trim(),
    scope: (input.scope ?? "").trim(),
    client_label: (input.clientLabel ?? "").trim(),
    highlight_stat: (input.highlightStat ?? "").trim(),
    client_quote: (input.clientQuote ?? "").trim(),
    metrics: input.metrics ?? [],
    services: Array.isArray(input.services)
      ? input.services.map((s) => String(s).trim()).filter(Boolean)
      : [],
  };

  let { data, error } = await supabase
    .from("case_studies")
    .insert(row)
    .select("id, slug")
    .single();

  if (error?.message?.includes("schema cache") || error?.message?.includes("Could not find")) {
    ({ data, error } = await supabase
      .from("case_studies")
      .insert({
        company_id: input.companyId,
        title,
        slug,
        summary,
        challenge: row.challenge,
        outcome: row.outcome,
        location: row.location,
        year: row.year,
        services: row.services,
      })
      .select("id, slug")
      .single());
  }

  if (error || !data) {
    return {
      ok: false,
      error: error?.message ?? "Could not create case study.",
    };
  }
  return {
    ok: true,
    data: { id: data.id as string, slug: data.slug as string },
  };
}

export type UpdateCaseStudyInput = {
  companyId: string;
  caseStudyId: string;
  title?: string;
  summary?: string;
  challenge?: string;
  outcome?: string;
  process?: string;
  location?: string;
  year?: string;
  duration?: string;
  sector?: string;
  scope?: string;
  clientLabel?: string;
  highlightStat?: string;
  clientQuote?: string;
  metrics?: CaseStudyMetric[];
  services?: string[];
};

/**
 * Update content fields only — never touches partner/client confirmation flags.
 */
export async function updateCaseStudyCore(
  supabase: SupabaseClient,
  input: UpdateCaseStudyInput,
): Promise<CoreResult<{ id: string }>> {
  const { data: existing } = await supabase
    .from("case_studies")
    .select("id")
    .eq("id", input.caseStudyId)
    .eq("company_id", input.companyId)
    .maybeSingle();

  if (!existing) return { ok: false, error: "Case study not found." };

  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) {
    const v = input.title.trim();
    if (!v) return { ok: false, error: "title cannot be empty." };
    patch.title = v;
  }
  if (input.summary !== undefined) patch.summary = input.summary.trim();
  if (input.challenge !== undefined) patch.challenge = input.challenge.trim();
  if (input.outcome !== undefined) patch.outcome = input.outcome.trim();
  if (input.process !== undefined) patch.process = input.process.trim();
  if (input.location !== undefined) patch.location = input.location.trim();
  if (input.year !== undefined) patch.year = input.year.trim();
  if (input.duration !== undefined) patch.duration = input.duration.trim();
  if (input.sector !== undefined) patch.sector = input.sector.trim();
  if (input.scope !== undefined) patch.scope = input.scope.trim();
  if (input.clientLabel !== undefined) patch.client_label = input.clientLabel.trim();
  if (input.highlightStat !== undefined) {
    patch.highlight_stat = input.highlightStat.trim();
  }
  if (input.clientQuote !== undefined) patch.client_quote = input.clientQuote.trim();
  if (input.metrics !== undefined) {
    if (!Array.isArray(input.metrics)) {
      return { ok: false, error: "metrics must be an array." };
    }
    patch.metrics = input.metrics;
  }
  if (input.services !== undefined) {
    if (!Array.isArray(input.services)) {
      return { ok: false, error: "services must be an array of strings." };
    }
    patch.services = input.services
      .map((s) => String(s).trim())
      .filter(Boolean);
  }

  if (Object.keys(patch).length === 0) {
    return { ok: false, error: "No fields to update." };
  }

  const { error } = await supabase
    .from("case_studies")
    .update(patch)
    .eq("id", input.caseStudyId)
    .eq("company_id", input.companyId);

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: input.caseStudyId } };
}

export async function deleteCaseStudyCore(
  supabase: SupabaseClient,
  companyId: string,
  caseStudyId: string,
): Promise<CoreResult<{ id: string }>> {
  const { data, error } = await supabase
    .from("case_studies")
    .delete()
    .eq("id", caseStudyId)
    .eq("company_id", companyId)
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "Case study not found." };
  return { ok: true, data: { id: caseStudyId } };
}

export type RequestClientConfirmationInput = {
  companyId: string;
  companyName: string;
  companySlug: string;
  caseStudySlug: string;
  email: string;
};

export async function tagCaseStudyPartnerCore(
  supabase: SupabaseClient,
  input: {
    companyId: string;
    caseStudyId: string;
    partnerCompanySlug: string;
    role: string;
  },
): Promise<CoreResult<{ partner_company_id: string }>> {
  const { data: cs } = await supabase
    .from("case_studies")
    .select("id")
    .eq("id", input.caseStudyId)
    .eq("company_id", input.companyId)
    .maybeSingle();
  if (!cs) return { ok: false, error: "Case study not found." };

  const slug = input.partnerCompanySlug.trim().toLowerCase();
  const { data: partner } = await supabase
    .from("companies")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (!partner) return { ok: false, error: "Partner company not found." };

  const { error } = await supabase.from("case_study_partners").insert({
    case_study_id: input.caseStudyId,
    partner_company_id: partner.id,
    role: input.role.trim(),
    confirmed: false,
  });

  if (error) {
    if (error.message.toLowerCase().includes("duplicate")) {
      return { ok: false, error: "Partner already tagged on this case study." };
    }
    return { ok: false, error: error.message };
  }

  return { ok: true, data: { partner_company_id: partner.id as string } };
}

export async function untagCaseStudyPartnerCore(
  supabase: SupabaseClient,
  input: {
    companyId: string;
    caseStudyId: string;
    partnerCompanyId: string;
  },
): Promise<CoreResult<{ partner_company_id: string }>> {
  const { data: cs } = await supabase
    .from("case_studies")
    .select("id")
    .eq("id", input.caseStudyId)
    .eq("company_id", input.companyId)
    .maybeSingle();
  if (!cs) return { ok: false, error: "Case study not found." };

  const { data, error } = await supabase
    .from("case_study_partners")
    .delete()
    .eq("case_study_id", input.caseStudyId)
    .eq("partner_company_id", input.partnerCompanyId)
    .select("partner_company_id")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "Partner tag not found." };
  return {
    ok: true,
    data: { partner_company_id: input.partnerCompanyId },
  };
}

export async function requestClientConfirmationCore(
  supabase: SupabaseClient,
  input: RequestClientConfirmationInput,
): Promise<CoreResult<{ id: string }>> {
  const email = input.email.trim().toLowerCase();
  const caseSlug = input.caseStudySlug.trim();
  if (!caseSlug || !email.includes("@")) {
    return { ok: false, error: "Enter a valid case_study_slug and email." };
  }

  const caseStudyId = await ensureCaseStudyRow(
    supabase,
    input.companyId,
    input.companySlug,
    caseSlug,
  );
  if (!caseStudyId) {
    return { ok: false, error: "Case study not found." };
  }

  const { data: caseMeta } = await supabase
    .from("case_studies")
    .select("title")
    .eq("id", caseStudyId)
    .eq("company_id", input.companyId)
    .single();

  const token = crypto.randomUUID();

  const { data: row, error } = await supabase
    .from("case_study_client_confirmation_requests")
    .insert({
      case_study_id: caseStudyId,
      requested_by_company_id: input.companyId,
      email,
      token,
      status: "pending",
    })
    .select("id")
    .single();

  if (error || !row) {
    return { ok: false, error: error?.message ?? "Could not create request." };
  }

  await sendClientConfirmationEmail({
    to: email,
    requesterName: input.companyName,
    caseTitle: caseMeta?.title ?? caseSlug,
    token,
  });

  return { ok: true, data: { id: row.id as string } };
}
