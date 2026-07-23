/** MCP tool handlers — maps tool name → Agent API call. */
import { uploadImage } from "./image.mjs";

export async function handleTool(name, args, { jsonAgent, agentFetch }) {
  switch (name) {
    case "hansala_get_company":
      return jsonAgent("GET", "/company");
    case "hansala_update_company":
      return jsonAgent("PATCH", "/company", args);
    case "hansala_upload_logo":
      return uploadImage(agentFetch, "/logo", args);
    case "hansala_upload_company_cover":
      return uploadImage(agentFetch, "/company/cover", args);
    case "hansala_refresh_logo":
      return jsonAgent("POST", "/logo/refresh");
    case "hansala_list_case_studies":
      return jsonAgent("GET", "/case-studies");
    case "hansala_get_case_study":
      return jsonAgent("GET", `/case-studies/${args.id}`);
    case "hansala_create_case_study":
      return jsonAgent("POST", "/case-studies", args);
    case "hansala_update_case_study": {
      const { id, ...body } = args;
      return jsonAgent("PATCH", `/case-studies/${id}`, body);
    }
    case "hansala_delete_case_study":
      return jsonAgent("DELETE", `/case-studies/${args.id}`);
    case "hansala_upload_case_study_cover":
      return uploadImage(agentFetch, `/case-studies/${args.id}/cover`, args);
    case "hansala_clear_case_study_cover":
      return agentFetch("DELETE", `/case-studies/${args.id}/cover`);
    case "hansala_upload_case_study_gallery":
      return uploadImage(agentFetch, `/case-studies/${args.id}/gallery`, args);
    case "hansala_remove_case_study_gallery_image":
      return agentFetch(
        "DELETE",
        `/case-studies/${args.id}/gallery?url=${encodeURIComponent(args.url)}`,
      );
    case "hansala_tag_case_study_partner":
      return jsonAgent("POST", `/case-studies/${args.id}/partners`, {
        partner_company_slug: args.partner_company_slug,
        role: args.role,
      });
    case "hansala_request_client_confirmation":
      return jsonAgent("POST", "/client-confirmations", args);
    case "hansala_list_references":
      return jsonAgent("GET", "/references");
    case "hansala_create_reference":
      return jsonAgent("POST", "/references", args);
    case "hansala_invite_reference":
      return jsonAgent("POST", `/references/${args.id}/invite`, {
        email: args.email,
      });
    case "hansala_list_partnerships":
      return jsonAgent("GET", "/partnerships");
    case "hansala_invite_partner":
      return jsonAgent("POST", "/partner-invites", {
        name: args.name ?? args.company_name,
        email: args.email,
        website: args.website,
        category: args.category,
        city: args.city,
      });
    case "hansala_get_verification_status":
      return jsonAgent("GET", "/verification");
    case "hansala_get_verification_instructions": {
      const method = args.method || "meta_tag";
      return agentFetch("GET", `/verification/instructions?method=${method}`);
    }
    case "hansala_run_verification_check":
      return jsonAgent("POST", "/verification/check", { method: args.method });
    case "hansala_list_inquiries":
      return jsonAgent("GET", "/inquiries");
    case "hansala_get_analytics":
      return jsonAgent("GET", "/analytics");
    case "hansala_list_team":
      return jsonAgent("GET", "/team");
    case "hansala_invite_team_member":
      return jsonAgent("POST", "/team/invitations", args);
    case "hansala_update_team_member": {
      const { member_id, ...body } = args;
      return jsonAgent("PATCH", `/team/members/${member_id}`, body);
    }
    case "hansala_upload_team_member_photo":
      return uploadImage(agentFetch, `/team/members/${args.member_id}/photo`, args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
