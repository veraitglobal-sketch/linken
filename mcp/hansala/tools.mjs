/** Hansala Agent MCP tool definitions. */
import { WIDGET_TOOLS } from "./widget-tools.mjs";

export const TOOLS = [
  {
    name: "hansala_get_company",
    description: "Read company profile (includes logo_url, cover_image_url, trust).",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "hansala_update_company",
    description:
      "Update profile: name, slug, category, tagline, description, services, location, social.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        slug: { type: "string" },
        category: { type: "string" },
        tagline: { type: "string" },
        description: { type: "string" },
        services: { type: "array", items: { type: "string" } },
        city: { type: "string" },
        country: { type: "string" },
        website: { type: "string" },
        accepting_clients: { type: "boolean" },
        linkedin_url: { type: "string" },
        facebook_url: { type: "string" },
      },
      additionalProperties: false,
    },
  },
  {
    name: "hansala_upload_logo",
    description: "Upload logo (image_path, image_url, or image_base64). Uses PUT.",
    inputSchema: {
      type: "object",
      properties: {
        image_path: { type: "string" },
        image_url: { type: "string" },
        image_base64: { type: "string" },
        content_type: { type: "string" },
      },
      additionalProperties: false,
    },
  },
  {
    name: "hansala_upload_company_cover",
    description: "Upload company cover photo. Uses PUT /company/cover.",
    inputSchema: {
      type: "object",
      properties: {
        image_path: { type: "string" },
        image_url: { type: "string" },
        image_base64: { type: "string" },
        content_type: { type: "string" },
      },
      additionalProperties: false,
    },
  },
  {
    name: "hansala_refresh_logo",
    description: "Re-fetch logo from company website.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "hansala_list_case_studies",
    description: "List all case studies.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "hansala_get_case_study",
    description: "Get one case study by UUID.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    name: "hansala_create_case_study",
    description: "Create case study (text). Upload cover/gallery separately via PUT.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        summary: { type: "string" },
        challenge: { type: "string" },
        outcome: { type: "string" },
        process: { type: "string" },
        location: { type: "string" },
        year: { type: "string" },
        duration: { type: "string" },
        sector: { type: "string" },
        scope: { type: "string" },
        client_label: { type: "string" },
        highlight_stat: { type: "string" },
        client_quote: { type: "string" },
        services: { type: "array", items: { type: "string" } },
      },
      required: ["title", "summary"],
      additionalProperties: false,
    },
  },
  {
    name: "hansala_update_case_study",
    description: "Update case study text or cover_image_url (remote fetch).",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        cover_image_url: { type: "string" },
        title: { type: "string" },
        summary: { type: "string" },
      },
      required: ["id"],
      additionalProperties: true,
    },
  },
  {
    name: "hansala_delete_case_study",
    description: "Delete a case study by UUID.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    name: "hansala_upload_case_study_cover",
    description: "Upload case study cover (PUT, not POST).",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        image_path: { type: "string" },
        image_url: { type: "string" },
        image_base64: { type: "string" },
      },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    name: "hansala_clear_case_study_cover",
    description: "Remove case study cover image.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    name: "hansala_upload_case_study_gallery",
    description: "Add gallery image (PUT).",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        image_path: { type: "string" },
        image_url: { type: "string" },
      },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    name: "hansala_remove_case_study_gallery_image",
    description: "Remove one gallery URL from a case study.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" }, url: { type: "string" } },
      required: ["id", "url"],
      additionalProperties: false,
    },
  },
  {
    name: "hansala_tag_case_study_partner",
    description: "Tag a partner company on a case study.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        partner_company_slug: { type: "string" },
        role: { type: "string" },
      },
      required: ["id", "partner_company_slug"],
      additionalProperties: false,
    },
  },
  {
    name: "hansala_request_client_confirmation",
    description: "Email client to confirm a case study.",
    inputSchema: {
      type: "object",
      properties: {
        case_study_slug: { type: "string" },
        email: { type: "string" },
      },
      required: ["case_study_slug", "email"],
      additionalProperties: false,
    },
  },
  {
    name: "hansala_list_references",
    description: "List service references.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "hansala_create_reference",
    description:
      "Create reference. Fields: client_name (or client), service, started_year (or start_year).",
    inputSchema: {
      type: "object",
      properties: {
        client_name: { type: "string" },
        client: { type: "string" },
        service: { type: "string" },
        started_year: { type: "string" },
        start_year: { type: "string" },
        ongoing: { type: "boolean" },
        invite_email: { type: "string" },
      },
      required: ["service"],
      additionalProperties: false,
    },
  },
  {
    name: "hansala_invite_reference",
    description: "Send reference confirmation invite email.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" }, email: { type: "string" } },
      required: ["id", "email"],
      additionalProperties: false,
    },
  },
  {
    name: "hansala_list_partnerships",
    description: "List partnerships.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "hansala_invite_partner",
    description: "Invite an unclaimed company as partner.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Partner company name" },
        company_name: { type: "string", description: "Alias for name" },
        email: { type: "string" },
        website: { type: "string" },
      },
      required: ["company_name", "email"],
      additionalProperties: false,
    },
  },
  {
    name: "hansala_get_verification_status",
    description: "Get verification status, token, and all method instructions.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "hansala_get_verification_instructions",
    description: "Get copy-paste snippet for one verification method.",
    inputSchema: {
      type: "object",
      properties: {
        method: {
          type: "string",
          enum: ["email_domain", "dns_txt", "meta_tag", "backlink"],
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "hansala_run_verification_check",
    description: "Run verification check (POST /verification/check).",
    inputSchema: {
      type: "object",
      properties: {
        method: {
          type: "string",
          enum: ["email_domain", "dns_txt", "meta_tag", "backlink"],
        },
      },
      required: ["method"],
      additionalProperties: false,
    },
  },
  {
    name: "hansala_list_inquiries",
    description: "List partnership inquiries.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "hansala_get_analytics",
    description: "Get profile analytics summary.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "hansala_list_team",
    description: "List team members and pending invitations.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "hansala_invite_team_member",
    description: "Invite a teammate.",
    inputSchema: {
      type: "object",
      properties: {
        first_name: { type: "string" },
        last_name: { type: "string" },
        email: { type: "string" },
        role: { type: "string" },
      },
      required: ["first_name", "last_name", "email"],
      additionalProperties: true,
    },
  },
  {
    name: "hansala_update_team_member",
    description: "Update team member profile or permissions.",
    inputSchema: {
      type: "object",
      properties: { member_id: { type: "string" } },
      required: ["member_id"],
      additionalProperties: true,
    },
  },
  {
    name: "hansala_upload_team_member_photo",
    description: "Upload team member avatar.",
    inputSchema: {
      type: "object",
      properties: {
        member_id: { type: "string" },
        image_path: { type: "string" },
        image_url: { type: "string" },
      },
      required: ["member_id"],
      additionalProperties: false,
    },
  },
  {
    name: "hansala_get_scheduling",
    description:
      "Get Calendly/Cal.com booking link on the company profile (Book a call CTA).",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "hansala_set_scheduling",
    description:
      "Set public Calendly or Cal.com booking URL (shows Book a call). OAuth login is browser-only — use a pasteable booking link. Requires settings:write.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "https://calendly.com/… or https://cal.com/…",
        },
        label: {
          type: "string",
          description: "CTA label (default Book a call)",
        },
        provider: {
          type: "string",
          enum: ["calendly", "calcom"],
          description: "Optional; detected from URL if omitted",
        },
      },
      required: ["url"],
      additionalProperties: false,
    },
  },
  {
    name: "hansala_disconnect_scheduling",
    description: "Remove booking link from the company profile. Requires settings:write.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "hansala_list_webhooks",
    description: "List outbound webhook endpoints. Requires webhooks:manage.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "hansala_create_webhook",
    description:
      "Create webhook endpoint (HTTPS URL + events). Secret returned once. Requires webhooks:manage.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string" },
        description: { type: "string" },
        events: {
          type: "array",
          items: {
            type: "string",
            enum: [
              "inquiry.created",
              "partnership.accepted",
              "reference.confirmed",
              "booking.connected",
            ],
          },
        },
      },
      required: ["url", "events"],
      additionalProperties: false,
    },
  },
  {
    name: "hansala_delete_webhook",
    description: "Delete a webhook endpoint by id. Requires webhooks:manage.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    name: "hansala_test_webhook",
    description: "Queue a test delivery to an endpoint. Requires webhooks:manage.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        event: {
          type: "string",
          enum: [
            "inquiry.created",
            "partnership.accepted",
            "reference.confirmed",
            "booking.connected",
          ],
        },
      },
      required: ["id"],
      additionalProperties: false,
    },
  },
  ...WIDGET_TOOLS,
];
