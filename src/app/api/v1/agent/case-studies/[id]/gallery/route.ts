/**
 * Agent API — case study gallery upload/remove.
 */
import type { NextRequest } from "next/server";
import { parseImageBody } from "@/features/agent-api/parse-image";
import { withAgentAuth } from "@/features/agent-api/handler";
import { agentOptions } from "@/features/agent-api/http";
import {
  addCaseStudyGalleryCore,
  removeCaseStudyGalleryCore,
} from "@/features/case-studies/media-core";
import { createAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ id: string }> };

export function OPTIONS() {
  return agentOptions();
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return withAgentAuth(request, "content:write", async (req, ctx) => {
    const admin = createAdminClient();
    if (!admin) {
      return {
        status: 503,
        body: { error: { code: "service_unavailable", message: "Unavailable." } },
      };
    }

    const contentType = req.headers.get("content-type") ?? "";
    const images: { bytes: Uint8Array; contentType: string }[] = [];

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const files = form
        .getAll("file")
        .concat(form.getAll("gallery"))
        .filter((f): f is File => f instanceof File && f.size > 0);
      if (files.length === 0) {
        return {
          status: 422,
          body: {
            error: {
              code: "invalid_request",
              message: "multipart field 'file' is required.",
            },
          },
          auditAction: "case_study.gallery.upload",
          auditSummary: "Missing file",
        };
      }
      for (const file of files) {
        images.push({
          bytes: new Uint8Array(await file.arrayBuffer()),
          contentType: file.type || "image/jpeg",
        });
      }
    } else {
      const image = await parseImageBody(req);
      if (!image.ok) {
        return {
          status: 422,
          body: { error: { code: "invalid_request", message: image.message } },
          auditAction: "case_study.gallery.upload",
          auditSummary: image.message,
        };
      }
      images.push({ bytes: image.bytes, contentType: image.contentType });
    }

    const result = await addCaseStudyGalleryCore(admin, {
      companyId: ctx.companyId,
      caseStudyId: id,
      images,
    });

    if (!result.ok) {
      const status = result.error === "Case study not found." ? 404 : 422;
      return {
        status,
        body: {
          error: {
            code: status === 404 ? "not_found" : "invalid_request",
            message: result.error,
          },
        },
        auditAction: "case_study.gallery.upload",
        auditSummary: result.error,
      };
    }

    return {
      status: 200,
      body: { data: result.data },
      auditAction: "case_study.gallery.upload",
      auditSummary: `Gallery +${result.data.added.length} for ${id}`,
    };
  });
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return withAgentAuth(request, "content:write", async (req, ctx) => {
    const admin = createAdminClient();
    if (!admin) {
      return {
        status: 503,
        body: { error: { code: "service_unavailable", message: "Unavailable." } },
      };
    }

    const url = new URL(req.url).searchParams.get("url")?.trim() ?? "";
    if (!url) {
      return {
        status: 422,
        body: {
          error: { code: "invalid_request", message: "Query param url is required." },
        },
        auditAction: "case_study.gallery.remove",
        auditSummary: "Missing url",
      };
    }

    const result = await removeCaseStudyGalleryCore(admin, {
      companyId: ctx.companyId,
      caseStudyId: id,
      url,
    });

    if (!result.ok) {
      const status = result.error === "Case study not found." ? 404 : 422;
      return {
        status,
        body: {
          error: {
            code: status === 404 ? "not_found" : "invalid_request",
            message: result.error,
          },
        },
        auditAction: "case_study.gallery.remove",
        auditSummary: result.error,
      };
    }

    return {
      status: 200,
      body: { data: result.data },
      auditAction: "case_study.gallery.remove",
      auditSummary: `Gallery image removed for ${id}`,
    };
  });
}
