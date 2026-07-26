/**
 * Agent API — upload replacement logo for one wall partner.
 * PUT /api/v1/agent/widgets/partners/[companyId]/logo
 * Scope: settings:write. Partner must be confirmed for ctx.companyId.
 */
import type { NextRequest } from "next/server";
import { getAgentCompanyOwnerMeta } from "@/features/agent-api/company-meta";
import { parseImageBody } from "@/features/agent-api/parse-image";
import { withAgentAuth } from "@/features/agent-api/handler";
import { agentMethodNotAllowed, agentOptions } from "@/features/agent-api/http";
import { applyPartnerWallLogoOverride } from "@/features/widgets/wall-override-apply";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export function OPTIONS() {
  return agentOptions();
}

export function POST() {
  return agentMethodNotAllowed(
    "PUT, OPTIONS",
    "Use PUT with image_base64, image_url, or multipart field 'file'.",
  );
}

type Ctx = { params: Promise<{ companyId: string }> };

export async function PUT(request: NextRequest, ctx: Ctx) {
  const { companyId: partnerId } = await ctx.params;

  return withAgentAuth(request, "settings:write", async (req, agent) => {
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

    const meta = await getAgentCompanyOwnerMeta(admin, agent.companyId);
    if (!meta) {
      return {
        status: 404,
        body: { error: { code: "not_found", message: "Company not found." } },
      };
    }

    const { data: owner } = await admin
      .from("companies")
      .select("id, name, slug, widget_settings")
      .eq("id", agent.companyId)
      .maybeSingle();
    if (!owner) {
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
          auditAction: "logo_wall.upload",
          auditSummary: "Missing file",
        };
      }
      bytes = new Uint8Array(await file.arrayBuffer());
      imageType = file.type || "image/png";
    } else {
      const image = await parseImageBody(req);
      if (!image.ok) {
        return {
          status: 422,
          body: {
            error: { code: "invalid_request", message: image.message },
          },
          auditAction: "logo_wall.upload",
          auditSummary: image.message,
        };
      }
      bytes = image.bytes;
      imageType = image.contentType;
    }

    const result = await applyPartnerWallLogoOverride(admin, {
      ownerCompanyId: agent.companyId,
      ownerName: owner.name as string,
      ownerSlug: owner.slug as string,
      partnerCompanyId: partnerId,
      currentSettings: owner.widget_settings,
      bytes,
      contentType: imageType,
    });

    if (!result.ok) {
      return {
        status: result.status === 403 ? 403 : 422,
        body: {
          error: {
            code: result.status === 403 ? "forbidden" : "invalid_request",
            message: result.error,
          },
        },
        auditAction: "logo_wall.upload",
        auditSummary: result.error,
      };
    }

    revalidatePath("/dashboard/widgets");
    revalidatePath(`/embed/${owner.slug}`);

    return {
      status: 200,
      body: { data: result.data },
      auditAction: "logo_wall.upload",
      auditSummary: `Wall override for ${partnerId}`,
    };
  });
}
