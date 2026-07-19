/**
 * Agent API — run a verification check (never confirms partnerships/refs).
 * Checklist: every DB query is hard-scoped to ctx.companyId from the API key.
 */
import type { NextRequest } from "next/server";
import { getAgentCompanyOwnerMeta } from "@/features/agent-api/company-meta";
import { parseJsonBody, withAgentAuth } from "@/features/agent-api/handler";
import { agentOptions } from "@/features/agent-api/http";
import {
  runVerificationCheckCore,
  type VerificationMethod,
} from "@/features/verification/core";
import { createAdminClient } from "@/lib/supabase/admin";

const METHODS = new Set<VerificationMethod>([
  "email_domain",
  "dns_txt",
  "meta_tag",
  "backlink",
]);

export function OPTIONS() {
  return agentOptions();
}

export async function POST(request: NextRequest) {
  return withAgentAuth(request, "verification:run", async (req, ctx) => {
    const admin = createAdminClient();
    if (!admin) {
      return {
        status: 503,
        body: {
          error: {
            code: "service_unavailable",
            message: "Agent API is unavailable.",
          },
        },
      };
    }

    const meta = await getAgentCompanyOwnerMeta(admin, ctx.companyId);
    if (!meta) {
      return {
        status: 404,
        body: { error: { code: "not_found", message: "Company not found." } },
      };
    }

    const parsed = await parseJsonBody<{ method?: string }>(req);
    if (!parsed.ok) {
      return {
        status: 422,
        body: { error: { code: "invalid_request", message: parsed.message } },
        auditAction: "verification.check",
        auditSummary: "Invalid body",
      };
    }

    const method = String(parsed.data.method ?? "") as VerificationMethod;
    if (!METHODS.has(method)) {
      return {
        status: 422,
        body: {
          error: {
            code: "invalid_request",
            message:
              "method must be email_domain | dns_txt | meta_tag | backlink.",
          },
        },
        auditAction: "verification.check",
        auditSummary: "Invalid method",
      };
    }

    let ownerEmail: string | null = null;
    if (method === "email_domain") {
      const { data } = await admin.auth.admin.getUserById(meta.ownerUserId);
      ownerEmail = data.user?.email ?? null;
    }

    const result = await runVerificationCheckCore(admin, {
      companyId: ctx.companyId,
      method,
      ownerEmail,
    });

    if (!result.ok) {
      return {
        status: 422,
        body: { error: { code: "invalid_request", message: result.error } },
        auditAction: "verification.check",
        auditSummary: `${method}: ${result.error}`,
      };
    }

    return {
      status: 200,
      body: { data: result.data },
      auditAction: "verification.check",
      auditSummary: `Verification check: ${method}`,
    };
  });
}
