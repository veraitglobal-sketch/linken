/**
 * Agent API — manual logo upload.
 * Checklist: every DB query is hard-scoped to ctx.companyId from the API key.
 */
import type { NextRequest } from "next/server";
import { getAgentCompanyOwnerMeta } from "@/features/agent-api/company-meta";
import { parseJsonBody, withAgentAuth } from "@/features/agent-api/handler";
import { agentOptions } from "@/features/agent-api/http";
import { uploadLogoCore } from "@/features/logo/core";
import { createAdminClient } from "@/lib/supabase/admin";

export function OPTIONS() {
  return agentOptions();
}

export async function PUT(request: NextRequest) {
  return withAgentAuth(request, "content:write", async (req, ctx) => {
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

    const contentType = req.headers.get("content-type") ?? "";
    let bytes: Uint8Array;
    let imageType: string;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file") ?? form.get("logo");
      if (!(file instanceof File)) {
        return {
          status: 422,
          body: {
            error: {
              code: "invalid_request",
              message: "multipart field 'file' (or 'logo') is required.",
            },
          },
          auditAction: "logo.upload",
          auditSummary: "Missing file",
        };
      }
      bytes = new Uint8Array(await file.arrayBuffer());
      imageType = file.type || "image/png";
    } else {
      const parsed = await parseJsonBody<{
        image_base64?: string;
        content_type?: string;
      }>(req);
      if (!parsed.ok) {
        return {
          status: 422,
          body: {
            error: { code: "invalid_request", message: parsed.message },
          },
          auditAction: "logo.upload",
          auditSummary: "Invalid body",
        };
      }
      const raw = String(parsed.data.image_base64 ?? "").replace(
        /^data:[^;]+;base64,/,
        "",
      );
      if (!raw) {
        return {
          status: 422,
          body: {
            error: {
              code: "invalid_request",
              message: "image_base64 is required for JSON uploads.",
            },
          },
          auditAction: "logo.upload",
          auditSummary: "Missing image_base64",
        };
      }
      bytes = Uint8Array.from(Buffer.from(raw, "base64"));
      imageType = String(parsed.data.content_type ?? "image/png");
    }

    const result = await uploadLogoCore(admin, ctx.companyId, {
      bytes,
      contentType: imageType,
      ownerUserId: meta.ownerUserId,
    });

    if (!result.ok) {
      return {
        status: 422,
        body: { error: { code: "invalid_request", message: result.error } },
        auditAction: "logo.upload",
        auditSummary: result.error,
      };
    }

    return {
      status: 200,
      body: { data: result.data },
      auditAction: "logo.upload",
      auditSummary: "Uploaded manual logo",
    };
  });
}
