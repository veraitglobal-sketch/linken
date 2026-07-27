/** Logo wall + widgets MCP tools (Agent API). */

export const WIDGET_TOOLS = [
  {
    name: "hansala_list_widget_variants",
    description:
      "List every embed variant from WIDGET_CATALOG: id, name, description, pro. Call before picking a snippet. Placement widgets: footer-strip, partners-rotate, case-gallery. Proof: testimonials (client-written, studio-curated). Logo wall id is \"logo-wall\".",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "hansala_list_widget_partners",
    description:
      "Call this first when curating the Logo wall. Returns every confirmed partner/client eligible for the wall: company_id, name, slug, website, logo_state ('profile'|'auto'|'custom'|'missing'|'opted_out'), shown. Match local filenames to name/slug (e.g. meridian.png → Meridian). Partners with logo_state 'missing' or 'auto' usually need a replacement — upload with hansala_upload_partner_logo, then set layout with hansala_update_widget_settings.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "hansala_get_widget_settings",
    description:
      "Read widget_settings including logoWall, placements (footer/partners/cases), testimonials (excluded_ids, order, layout, limit), plus allow_logo_in_partner_widgets and accepting_clients.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "hansala_update_widget_settings",
    description:
      "Partial PATCH for widget presentation. Omitted fields stay unchanged (merge, never wipe). Logo wall: exclusion-based — default shows every confirmed partner. logo_wall.background: \"transparent\" | \"light\" | \"dark\" | \"#RRGGBB\". logo_wall.limit: 1–30. logo_wall.motion: \"row\" | \"stack\" | \"fade\" | \"grid\" | \"swap-batch\" | \"swap-random\". logo_wall.size: \"sm\" | \"md\" | \"lg\" | \"xl\". logo_wall.order / excluded_company_ids / overrides. Testimonials: testimonials.excluded_ids, testimonials.order, testimonials.layout (single|carousel|grid|masonry|marquee|editorial|featured|strip), testimonials.limit 1–30. New published testimonials appear automatically unless excluded.",
    inputSchema: {
      type: "object",
      properties: {
        variant: {
          type: "string",
          description: "Preferred embed variant id for snippets (not persisted).",
        },
        logo_wall: {
          type: "object",
          properties: {
            background: {
              type: "string",
              description:
                'Exactly: "transparent" | "light" | "dark" | "#RRGGBB"',
            },
            limit: {
              type: "number",
              description: "How many included logos to render (1–30, default 12).",
            },
            motion: {
              type: "string",
              description:
                'Exactly: "row" | "stack" | "fade" | "grid" | "swap-batch" | "swap-random"',
            },
            size: {
              type: "string",
              description: 'Exactly: "sm" | "md" | "lg" | "xl"',
            },
            order: { type: "array", items: { type: "string" } },
            excluded_company_ids: {
              type: "array",
              items: { type: "string" },
            },
            overrides: {
              type: "object",
              additionalProperties: {
                type: "object",
                properties: {
                  scale: { type: "number" },
                  padding: { type: "number" },
                  grayscale: { type: "boolean" },
                  invertOnDark: { type: "boolean" },
                },
              },
            },
          },
          additionalProperties: false,
        },
        allow_logo_in_partner_widgets: { type: "boolean" },
        accepting_clients: { type: "boolean" },
        testimonials: {
          type: "object",
          properties: {
            excluded_ids: { type: "array", items: { type: "string" } },
            order: { type: "array", items: { type: "string" } },
            layout: {
              type: "string",
              description:
                "single | carousel | grid | masonry | marquee | editorial | featured | strip",
            },
            limit: { type: "number", description: "1–30" },
            theme: {
              type: "object",
              description:
                "preset, fontFamily, fontSize, lineHeight, textColor, mutedColor, accentColor, background, cardBackground, borderColor, borderWidth, radius, shadow (none|soft|lifted), spacing, align (left|center), customCss",
            },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "hansala_upload_partner_logo",
    description:
      "Upload a replacement logo for one wall partner (PNG/SVG/WebP). Sets logoWall.overrides[company_id].logoUrl and emails the partner with a one-click reject link. Requires company_id from hansala_list_widget_partners plus image_path (local file), image_url, or image_base64.",
    inputSchema: {
      type: "object",
      properties: {
        company_id: { type: "string" },
        image_path: { type: "string" },
        image_url: { type: "string" },
        image_base64: { type: "string" },
        content_type: { type: "string" },
      },
      required: ["company_id"],
      additionalProperties: false,
    },
  },
  {
    name: "hansala_get_widget_snippet",
    description:
      "Return the pasteable iframe for the company. Default variant is logo-wall. Pass variant to override (e.g. horizontal, verified, logo-wall, testimonials). testimonials snippet includes embed-resize.js for auto height. Background and selection come from saved widget_settings — paste once; manage forever from API/dashboard.",
    inputSchema: {
      type: "object",
      properties: {
        variant: {
          type: "string",
          description: "Catalog id. Default: logo-wall",
        },
        theme: {
          type: "string",
          enum: ["light", "dark"],
          description: "Query theme; logoWall.background overrides when set.",
        },
      },
      additionalProperties: false,
    },
  },
];
