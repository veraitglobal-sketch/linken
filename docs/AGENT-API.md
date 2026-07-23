# Hansala Agent API

Base URL: `https://hansala.com/api/v1/agent` (local: `http://localhost:3000/api/v1/agent`)

Auth: `Authorization: Bearer hs_...`

OpenAPI: `GET /api/v1/openapi`

## Scopes

| Scope | Use |
|-------|-----|
| `read` | GET company, case studies, references, partnerships |
| `content:write` | PATCH profile, case studies, image uploads |
| `invites:send` | Reference/partner/client confirmation emails (20/day) |
| `verification:run` | Domain verification checks |
| `team:manage` | Team CRUD |
| `full_access` preset | All scopes |

## Critical: image uploads use **PUT**, not POST

POST returns `405` with hint. JSON body:

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

# Cover
curl -X PUT "$BASE/company/cover" -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -d '{"image_path":"..."}'  # use image_base64 or image_url in API
```

Allowed PATCH fields: `name`, `slug`, `category`, `tagline`, `description`, `services`, `city`, `country`, `website`, `accepting_clients`, `linkedin_url`, `facebook_url`.

## Case studies

```bash
curl -X POST "$BASE/case-studies" -d '{"title":"...","summary":"..."}'
curl -X PATCH "$BASE/case-studies/{id}" -d '{"cover_image_url":"https://..."}'
curl -X PUT "$BASE/case-studies/{id}/cover" -d '{"image_base64":"..."}'
curl -X PUT "$BASE/case-studies/{id}/gallery" -d '{"image_url":"..."}'
curl -X DELETE "$BASE/case-studies/{id}/gallery?url=..."
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
```

Invite separately (needs `invites:send`):

```bash
curl -X POST "$BASE/references/{id}/invite" -d '{"email":"info@client.de"}'
```

## Verification

```bash
curl "$BASE/verification" -H "Authorization: Bearer $KEY"
curl "$BASE/verification/instructions?method=meta_tag"
curl -X POST "$BASE/verification/check" -d '{"method":"meta_tag"}'
```

Add meta tag from `instructions.meta_tag` to site `<head>`, then run check.

## MCP

See `mcp/hansala/` — 30 tools covering profile, media, references, partners, verification.

Runbook: `docs/AGENT-ONBOARDING-RUNBOOK.md`
