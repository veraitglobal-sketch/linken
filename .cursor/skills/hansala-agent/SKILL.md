---
name: hansala-agent
description: >-
  Manage Hansala company content via Agent API (lk_ keys) or the hansala MCP
  server. Use when creating case studies, uploading photos, inviting team
  members, or populating a Hansala profile programmatically from Cursor/Claude.
---

# Hansala Agent API

`lk_` keys are **Hansala Agent API keys** — not Linkup, Clado, or other services.

## Setup

1. Dashboard → **API** → create key with **Full access** (or `content:write` + `team:manage`).
2. Add to `.env.local` (never paste keys in chat):
   - `HANSALA_AGENT_API_KEY=lk_...`
   - `HANSALA_API_BASE=http://localhost:3000` (or `https://hansala.com`)
3. Optional MCP: copy `.cursor/mcp.json.example` → `.cursor/mcp.json`, run `npm install` in `mcp/hansala/`.

## Auth

```
Authorization: Bearer lk_...
Base: /api/v1/agent
```

## Case study workflow (AI)

1. `POST /case-studies` — title, summary, challenge, outcome, process, metrics, etc.
2. `PUT /case-studies/{id}/cover` — JSON `{ image_base64, content_type }` or multipart `file`
3. `PUT /case-studies/{id}/gallery` — same (max 8 images)
4. `POST /client-confirmations` — `{ case_study_slug, email }` (human confirms)
5. Public URL returned in `case_study.public_url`

## Team workflow (AI)

1. `GET /team` — list members (`member_id` is opaque hash, not user UUID)
2. `POST /team/invitations` — invite; optional `permissions[]` for members
3. `PATCH /team/members/{member_id}` — profile, role, permissions
4. `PUT /team/members/{member_id}/photo` — avatar upload

## Sacred rules

- Never set partner/client **confirmed** flags via API.
- Confirmations are human-only (email links).
- All routes scoped to the API key's company.

## MCP tools

When MCP is configured: `hansala_create_case_study`, `hansala_upload_case_study_cover`, `hansala_invite_team_member`, etc. — see `mcp/hansala/index.mjs`.
