/**
 * Agent API — company cover upload/clear.
 */
import type { NextRequest } from "next/server";
import { parseImageBody } from "@/features/agent-api/parse-image";
import { withAgentAuth } from "@/features/agent-api/handler";
import { agentMethodNotAllowed, agentOptions } from "@/features/agent-api/http";
import {
  clearCompanyCoverCore,
  uploadCompanyCoverCore,
} from "@/features/company/cover-core";
import { createAdminClient } from "@/lib/supabase/admin";

const UPLOAD_HINT =
  "Use PUT with image_base64, image_url, or multipart file field 'file'. DELETE clears the cover.";

export function OPTIONS() {
  return agentOptions();
}

export function POST() {
  return agentMethodNotAllowed("PUT, DELETE, OPTIONS", UPLOAD_HINT);
}

export async function PUT(request: NextRequest) {
  return withAgentAuth(request, "content:write", async (req, ctx) => {
    const admin = createAdminClient();
    if (!admin) {
      return {
        status: 503,
        body: { error: { code: "service_unavailable", message: "Unavailable." } },
      };
    }

    const image = await parseImageBody(req);
    if (!image.ok) {
      return {
        status: 422,
        body: { error: { code: "invalid_request", message: image.message } },
        auditAction: "company.cover.upload",
        auditSummary: image.message,
      };
    }

    const result = await uploadCompanyCoverCore(admin, {
      companyId: ctx.companyId,
      bytes: image.bytes,
      contentType: image.contentType,
    });

    if (!result.ok) {
      return {
        status: 422,
        body: { error: { code: "invalid_request", message: result.error } },
        auditAction: "company.cover.upload",
        auditSummary: result.error,
      };
    }

    return {
      status: 200,
      body: { data: result.data },
      auditAction: "company.cover.upload",
      auditSummary: "Uploaded company cover",
    };
  });
}

export async function DELETE(_request: NextRequest) {
  return withAgentAuth(_request, "content:write", async (_req, ctx) => {
    const admin = createAdminClient();
    if (!admin) {
      return {
        status: 503,
        body: { error: { code: "service_unavailable", message: "Unavailable." } },
      };
    }

    const result = await clearCompanyCoverCore(admin, ctx.companyId);
    if (!result.ok) {
      return {
        status: 422,
        body: { error: { code: "invalid_request", message: result.error } },
        auditAction: "company.cover.clear",
        auditSummary: result.error,
      };
    }

    return {
      status: 200,
      body: { data: result.data },
      auditAction: "company.cover.clear",
      auditSummary: "Cleared company cover",
    };
  });
}
