/**
 * Agent API — verification instructions for one method.
 */
import type { NextRequest } from "next/server";
import { withAgentAuth } from "@/features/agent-api/handler";
import { agentOptions } from "@/features/agent-api/http";
import {
  getVerificationStatusCore,
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

export async function GET(request: NextRequest) {
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

    const method = (new URL(req.url).searchParams.get("method") ??
      "meta_tag") as VerificationMethod;
    if (!METHODS.has(method)) {
      return {
        status: 422,
        body: {
          error: {
            code: "invalid_request",
            message: "method must be email_domain, dns_txt, meta_tag, or backlink.",
          },
        },
      };
    }

    const result = await getVerificationStatusCore(admin, ctx.companyId);
    if (!result.ok) {
      return {
        status: 404,
        body: { error: { code: "not_found", message: result.error } },
      };
    }

    const { verify_token, instructions, domain, slug, website } = result.data;
    const snippet =
      method === "meta_tag"
        ? instructions.meta_tag
        : method === "dns_txt"
          ? instructions.dns_txt
          : method === "backlink"
            ? instructions.backlink
            : `Match owner email domain to website (${website}).`;

    return {
      status: 200,
      body: {
        data: {
          method,
          verify_token,
          domain,
          slug,
          website,
          snippet,
          html_head_example:
            method === "meta_tag"
              ? `<head>\n  ${instructions.meta_tag}\n</head>`
              : undefined,
          next_step: `POST /api/v1/agent/verification/check with {"method":"${method}"}`,
        },
      },
      skipAudit: true,
    };
  });
}
