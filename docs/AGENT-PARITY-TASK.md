# Agent API — full parity with UI edit hub

Tracking doc for Agent API + MCP work. Target: `full_access` key can fully onboard a profile (e.g. Vera IT, slug `vera`) without browser UI.

## Status

### P0 — Done in repo

- [x] References POST: aliases `client`→`client_name`, `start_year`→`started_year`; clear errors
- [x] Optional `invite_email` on reference create (requires `invites:send`)
- [x] Image routes: POST → 405 with PUT hint; `image_url` remote fetch
- [x] `PUT /api/v1/agent/company/cover`
- [x] PATCH company: `name`, `category`, `slug` (+ existing fields)
- [x] GET company: `logo_url`, `cover_image_url`
- [x] PATCH case study: `cover_image_url` remote fetch
- [x] `GET /verification/instructions?method=`

### P1 — MCP

- [x] Expanded `mcp/hansala/` (30 tools): verification, references, partners, delete case study, company cover, gallery remove, etc.
- [x] `image_url` in MCP upload helpers

### P2 — Docs

- [x] `docs/AGENT-API.md`
- [x] `docs/AGENT-ONBOARDING-RUNBOOK.md`
- [x] `GET /api/v1/openapi`
- [x] `scripts/agent-smoke-test.mjs`

### P3 — Deploy / verify

- [ ] Deploy to production
- [ ] Run smoke test against live key for `vera`
- [ ] Full Vera IT onboarding script (assets from verait.de)

## Out of scope

- Auto-confirm partnerships/references/case studies
- Admin/global routes via agent key

## Key paths

| Area | Path |
|------|------|
| Routes | `src/app/api/v1/agent/` |
| Company patch | `src/features/company/agent-patch.ts` |
| Cover upload | `src/features/company/cover-core.ts` |
| Reference aliases | `src/features/agent-api/reference-body.ts` |
| MCP | `mcp/hansala/` |

See full original prompt in chat / agent transcript for acceptance criteria and Vera IT test matrix.
