type Op = { summary: string; operationId: string };

function op(summary: string, operationId: string): Op {
  return { summary, operationId };
}

/** Path catalog for Agent API OpenAPI 3.1. */
export const AGENT_OPENAPI_PATHS = {
  "/company": {
    get: op("Get company profile", "getCompany"),
    patch: op("Update profile (name, slug, category, tagline, …)", "patchCompany"),
  },
  "/company/cover": {
    put: op("Upload company cover (PUT)", "putCompanyCover"),
    delete: op("Clear company cover", "deleteCompanyCover"),
  },
  "/logo": { put: op("Upload logo (PUT)", "putLogo") },
  "/logo/refresh": {
    post: op("Refresh logo from company website", "refreshLogo"),
  },
  "/case-studies": {
    get: op("List case studies", "listCaseStudies"),
    post: op("Create case study", "createCaseStudy"),
  },
  "/case-studies/{id}": {
    get: op("Get case study", "getCaseStudy"),
    patch: op("Update case study (+ optional cover_image_url fetch)", "patchCaseStudy"),
    delete: op("Delete case study", "deleteCaseStudy"),
  },
  "/case-studies/{id}/cover": {
    put: op("Upload case study cover (PUT)", "putCaseCover"),
    delete: op("Clear case study cover", "deleteCaseCover"),
  },
  "/case-studies/{id}/gallery": {
    put: op("Add gallery image (PUT)", "putCaseGallery"),
    delete: op("Remove gallery image (?url=)", "deleteCaseGallery"),
  },
  "/case-studies/{id}/partners": {
    post: op("Tag partner on case study (confirmed=false until human)", "tagCasePartner"),
    delete: op("Untag partner on case study", "untagCasePartner"),
  },
  "/client-confirmations": {
    post: op("Email invite for client to confirm a case study", "clientConfirmation"),
  },
  "/references": {
    get: op("List references", "listReferences"),
    post: op("Create reference (client_name, service, started_year)", "createReference"),
  },
  "/references/{id}": {
    patch: op("Update reference content fields", "patchReference"),
    delete: op("Delete reference", "deleteReference"),
  },
  "/references/{id}/invite": {
    post: op("Send reference confirmation invite", "inviteReference"),
  },
  "/partnerships": {
    get: op("List partnerships (read-only)", "listPartnerships"),
  },
  "/partner-invites": {
    post: op("Invite unclaimed partner (pending)", "invitePartner"),
  },
  "/verification": {
    get: op("Verification status + owner instructions", "getVerification"),
  },
  "/verification/instructions": {
    get: op("Snippet for one method (?method=meta_tag|dns|…)", "getVerificationInstructions"),
  },
  "/verification/check": {
    post: op("Run domain verification check", "checkVerification"),
  },
  "/team": {
    get: op("List members + pending invites (requires team:manage)", "listTeam"),
  },
  "/team/invitations": {
    post: op("Create team invitation", "createTeamInvitation"),
  },
  "/team/invitations/{id}": {
    delete: op("Cancel pending team invitation", "cancelTeamInvitation"),
  },
  "/team/members/{memberId}": {
    patch: op("Update member profile/role/permissions", "patchTeamMember"),
    delete: op("Remove team member", "deleteTeamMember"),
  },
  "/team/members/{memberId}/photo": {
    put: op("Upload team member photo (PUT)", "putTeamMemberPhoto"),
  },
  "/group": {
    get: op("Read company group structure", "getGroup"),
    post: op("Create company group", "createGroup"),
  },
  "/group/invites": {
    post: op("Invite existing company to group (they confirm)", "inviteGroupMember"),
  },
  "/group/subsidiaries": {
    post: op("Create auto-confirmed subsidiary (owner structure statement)", "createSubsidiary"),
  },
  "/group/parent-proposals": {
    post: op("Set or propose group parent", "proposeGroupParent"),
  },
  "/group/members/{companyId}": {
    delete: op("End group membership", "removeGroupMember"),
  },
  "/inquiries": { get: op("List profile inquiries", "listInquiries") },
  "/inquiries/{id}": { patch: op("Triage inquiry status", "patchInquiry") },
  "/analytics": { get: op("Profile analytics for keyed company", "getAnalytics") },
  "/audit-log": { get: op("Own API audit trail", "getAuditLog") },
  "/widgets": {
    get: op("Embed variant catalog/snippets (requires settings:write)", "listWidgets"),
  },
  "/widget-settings": {
    get: op("Read widget_settings", "getWidgetSettings"),
    patch: op("Update widget settings", "patchWidgetSettings"),
  },
  "/scheduling": {
    get: op("Read Calendly/Cal.com booking link (Book a call)", "getScheduling"),
    put: op("Set Calendly or Cal.com public booking URL (settings:write)", "putScheduling"),
    delete: op("Disconnect booking link (settings:write)", "deleteScheduling"),
  },
  "/webhooks": {
    get: op("List webhook endpoints (webhooks:manage)", "listWebhooks"),
    post: op("Create webhook endpoint (secret returned once)", "createWebhook"),
  },
  "/webhooks/{id}": {
    patch: op("Update webhook endpoint", "patchWebhook"),
    delete: op("Delete webhook endpoint", "deleteWebhook"),
  },
  "/webhooks/{id}/test": {
    post: op("Queue a test delivery for an endpoint", "testWebhook"),
  },
} as const;
