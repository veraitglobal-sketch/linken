# Hansala Agent API

Base URL: `https://hansala.com/api/v1/agent` (local: `http://localhost:3000/api/v1/agent`)

Auth: `Authorization: Bearer hs_...` (legacy `lk_` still accepted)

OpenAPI: `GET /api/v1/openapi` (full agent route index)

## Scopes

| Scope | Use |
|-------|-----|
| `read` | GET company, case studies, references, partnerships, inquiries, analytics, audit-log |
| `content:write` | PATCH profile, case studies, image uploads, references content |
| `invites:send` | Reference / partner / client confirmation emails (20/day) |
| `verification:run` | Domain verification status, instructions, check |
| `team:manage` | Team list, invitations, members, photos (**including GET /team**) |
| `structure:manage` | Company groups, subsidiaries, parent proposals |
| `settings:write` | Widgets catalog + widget-settings (**including GET /widgets**) |
| `inquiries:manage` | PATCH inquiry triage |
| `full_access` preset | All scopes above |
| `content_manager` preset | `read` + `content:write` + `invites:send` |
| `read_only` preset | `read` only |

Rate limits: **120 req/key/minute**; invite emails **20/key/day**. Soft (per-instance).

## Sacred rules

- Never auto-confirm partnerships, references, or case studies — invite only; humans confirm via email.
- Never set `confirmed` flags via API. Case-study partner tags stay `confirmed=false` until a human.
- No ownership transfer via Agent API.
- Company hard-scoped to the API key — foreign company ids ignored/rejected.

## Critical: image uploads use **PUT**, not POST

POST returns `405` with hint (logo, covers, gallery, team photo). JSON body:

```json
{ "image_base64": "...", "content_type": "image/png" }
```

Or remote fetch:

```json
{ "image_url": "https://example.com/logo.png" }
```

Or multipart field `file`.

## Image dimensions (match these to avoid bad crops)

| Asset | Size | Ratio | Formats | Max |
|-------|------|-------|---------|-----|
| Company cover | **1200 × 1400 px** | 6∶7 portrait | JPG, PNG, WEBP | 8 MB |
| Company logo | **512 × 512 px** | 1∶1 square | PNG, SVG | 1 MB |
| Case study cover | **1920 × 1200 px** | 16∶10 landscape | JPG, PNG, WEBP | 8 MB |
| Case study gallery | **1200 × 900 px** | 4∶3 landscape | JPG, PNG, WEBP | 8 MB |
| Team photo | **400 × 400 px** | 1∶1 square | JPG, PNG, WEBP | 2 MB |

Company cover fills a **vertical panel** on the profile hero (`object-cover`). Do not upload wide banners, OG images, or logos — use a portrait photo. Keep the subject centered.

Source of truth: `src/lib/media-specs.ts`.

## Company profile

```bash
# Read (includes logo_url, cover_image_url)
curl -s "$BASE/company" -H "Authorization: Bearer $KEY"

# Update name, category, slug, text fields
curl -X PATCH "$BASE/company" -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Vera IT","category":"IT","tagline":"..."}'

# Logo
curl -X PUT "$BASE/logo" -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -d '{"image_url":"https://verait.de/assets/logo.png"}'

# Refresh logo from website
curl -X POST "$BASE/logo/refresh" -H "Authorization: Bearer $KEY"

# Cover
curl -X PUT "$BASE/company/cover" -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -d '{"image_url":"https://…"}'
```

Allowed PATCH fields: `name`, `slug`, `category`, `tagline`, `description`, `services`, `city`, `country`, `website`, `accepting_clients`, `linkedin_url`, `facebook_url`.

Not writable: `verified`, `plan`, `claimed`, and other system fields.

## Case studies

```bash
curl -X POST "$BASE/case-studies" -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" -d '{"title":"...","summary":"..."}'
curl -X PATCH "$BASE/case-studies/{id}" -d '{"cover_image_url":"https://..."}'
curl -X PUT "$BASE/case-studies/{id}/cover" -d '{"image_base64":"..."}'
curl -X PUT "$BASE/case-studies/{id}/gallery" -d '{"image_url":"..."}'
curl -X DELETE "$BASE/case-studies/{id}/gallery?url=..."
curl -X POST "$BASE/case-studies/{id}/partners" -d '{"partner_company_id":"…"}'
curl -X DELETE "$BASE/case-studies/{id}/partners" -d '{"partner_company_id":"…"}'
curl -X POST "$BASE/client-confirmations" -d '{"case_study_slug":"…","email":"…"}'
curl -X DELETE "$BASE/case-studies/{id}"
```

## References

Required fields: `client_name` (alias: `client`), `service`, `started_year` (alias: `start_year`).

```bash
curl -X POST "$BASE/references" -d '{
  "client_name": "ReinAllround",
  "service": "KI-first Plattform",
  "started_year": "2024",
  "ongoing": true,
  "invite_email": "info@client.de"
}'
curl -X PATCH "$BASE/references/{id}" -d '{"service":"…"}'
curl -X DELETE "$BASE/references/{id}"
curl -X POST "$BASE/references/{id}/invite" -d '{"email":"info@client.de"}'
```

## Network

```bash
curl "$BASE/partnerships" -H "Authorization: Bearer $KEY"
curl -X POST "$BASE/partner-invites" -d '{"name":"…","invite_email":"…"}'
```

No accept/decline via Agent API.

## Verification

```bash
curl "$BASE/verification" -H "Authorization: Bearer $KEY"
curl "$BASE/verification/instructions?method=meta_tag"
curl -X POST "$BASE/verification/check" -d '{"method":"meta_tag"}'
```

Add meta tag from `instructions.meta_tag` to site `<head>`, then run check.

## Team (`team:manage`)

```bash
curl "$BASE/team" -H "Authorization: Bearer $KEY"
curl -X POST "$BASE/team/invitations" -d '{"email":"…","role":"member"}'
curl -X DELETE "$BASE/team/invitations/{id}"
curl -X PATCH "$BASE/team/members/{memberId}" -d '{"title":"…"}'
curl -X PUT "$BASE/team/members/{memberId}/photo" -d '{"image_url":"…"}'
curl -X DELETE "$BASE/team/members/{memberId}"
```

`member_id` is an opaque hash, not the user UUID.

## Group / structure (`structure:manage`)

```bash
curl "$BASE/group"
curl -X POST "$BASE/group" -d '{"name":"…"}'
curl -X POST "$BASE/group/invites" -d '{"company_id":"…"}'
curl -X POST "$BASE/group/subsidiaries" -d '{"name":"…"}'
curl -X POST "$BASE/group/parent-proposals" -d '{"parent_company_id":"…"}'
curl -X DELETE "$BASE/group/members/{companyId}"
```

Subsidiaries are an explicit exception: created as auto-confirmed structure under the owner.

## Inquiries, analytics, widgets

```bash
curl "$BASE/inquiries"                              # scope: read
curl -X PATCH "$BASE/inquiries/{id}" -d '{"status":"…"}'  # inquiries:manage
curl "$BASE/analytics"                              # read
curl "$BASE/audit-log"                              # read
curl "$BASE/widgets"                                # settings:write
curl "$BASE/widget-settings"                        # settings:write
curl -X PATCH "$BASE/widget-settings" -d '{…}'
```

## MCP

See `mcp/hansala/` — tools covering profile, media, references, partners, verification, team.

Runbook: `docs/AGENT-ONBOARDING-RUNBOOK.md`
