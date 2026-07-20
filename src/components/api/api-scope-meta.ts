import {
  AGENT_SCOPE_PRESETS,
  type AgentScope,
} from "@/features/agent-api/types";

export const SCOPE_META: {
  id: AgentScope;
  label: string;
  description: string;
}[] = [
  {
    id: "read",
    label: "Read",
    description:
      "Company, references, partnerships, inquiries, analytics, audit.",
  },
  {
    id: "content:write",
    label: "Content write",
    description: "References, case studies, logo, profile fields, partner tags.",
  },
  {
    id: "invites:send",
    label: "Invites",
    description: "Send confirmation / claim invites — cannot confirm anything.",
  },
  {
    id: "team:manage",
    label: "Team",
    description: "Invite and remove teammates (they accept via /join).",
  },
  {
    id: "structure:manage",
    label: "Structure",
    description: "Groups, subsidiaries, hierarchy proposals.",
  },
  {
    id: "settings:write",
    label: "Settings",
    description: "Widget settings, logo-wall exclusions, accepting clients.",
  },
  {
    id: "inquiries:manage",
    label: "Inquiries",
    description: "Update inquiry status (read / replied / archived).",
  },
  {
    id: "verification:run",
    label: "Verification",
    description: "Read verify instructions and run domain / backlink checks.",
  },
];

export const KEY_PRESETS: {
  id: keyof typeof AGENT_SCOPE_PRESETS;
  label: string;
  description: string;
}[] = [
  {
    id: "read_only",
    label: "Read only",
    description: "read — inspect your graph and content.",
  },
  {
    id: "content_manager",
    label: "Content manager",
    description: "read + content:write + invites:send",
  },
  {
    id: "full_access",
    label: "Full access",
    description: "All scopes — full owner parity except confirmations.",
  },
];
