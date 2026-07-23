import { getSiteUrl } from "@/lib/site";

/** Minimal OpenAPI 3.1 spec for Hansala Agent API v1. */
export async function GET() {
  const base = `${getSiteUrl()}/api/v1/agent`;
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "Hansala Agent API",
      version: "1.0.0",
      description:
        "Authenticated API for AI agents. Image uploads use PUT. See docs/AGENT-API.md.",
    },
    servers: [{ url: base }],
    security: [{ bearerAuth: [] }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "hs_" },
      },
    },
    paths: {
      "/company": {
        get: { summary: "Get company profile", operationId: "getCompany" },
        patch: { summary: "Update profile (name, slug, category, …)", operationId: "patchCompany" },
      },
      "/company/cover": {
        put: { summary: "Upload company cover (PUT)", operationId: "putCompanyCover" },
        delete: { summary: "Clear company cover", operationId: "deleteCompanyCover" },
      },
      "/logo": {
        put: { summary: "Upload logo (PUT)", operationId: "putLogo" },
      },
      "/case-studies": {
        get: { summary: "List case studies", operationId: "listCaseStudies" },
        post: { summary: "Create case study", operationId: "createCaseStudy" },
      },
      "/case-studies/{id}": {
        get: { summary: "Get case study", operationId: "getCaseStudy" },
        patch: { summary: "Update case study (+ cover_image_url URL fetch)", operationId: "patchCaseStudy" },
        delete: { summary: "Delete case study", operationId: "deleteCaseStudy" },
      },
      "/case-studies/{id}/cover": {
        put: { summary: "Upload cover binary (PUT, not POST)", operationId: "putCaseCover" },
        delete: { summary: "Clear cover", operationId: "deleteCaseCover" },
      },
      "/case-studies/{id}/gallery": {
        put: { summary: "Add gallery image (PUT)", operationId: "putCaseGallery" },
        delete: { summary: "Remove gallery URL ?url=", operationId: "deleteCaseGallery" },
      },
      "/references": {
        get: { summary: "List references", operationId: "listReferences" },
        post: {
          summary: "Create reference (client_name, service, started_year)",
          operationId: "createReference",
        },
      },
      "/references/{id}/invite": {
        post: { summary: "Send reference invite", operationId: "inviteReference" },
      },
      "/partner-invites": {
        post: { summary: "Invite unclaimed partner", operationId: "invitePartner" },
      },
      "/verification": {
        get: { summary: "Verification status + instructions", operationId: "getVerification" },
      },
      "/verification/instructions": {
        get: { summary: "Snippet for one method ?method=meta_tag", operationId: "getVerificationInstructions" },
      },
      "/verification/check": {
        post: { summary: "Run verification check", operationId: "checkVerification" },
      },
      "/client-confirmations": {
        post: { summary: "Request case study client confirmation", operationId: "clientConfirmation" },
      },
    },
  };

  return Response.json(spec, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
