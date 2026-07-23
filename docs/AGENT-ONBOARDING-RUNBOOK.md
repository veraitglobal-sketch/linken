# Agent onboarding runbook (Vera IT example)

Replace `BASE`, `KEY`, and asset paths. Human confirmation links are always required for trust.

## 1. Company profile

```bash
export BASE=https://hansala.com/api/v1/agent
export KEY=hs_...

curl -X PATCH "$BASE/company" -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Vera IT","category":"IT","description":"...","services":["..."]}'

curl -X PUT "$BASE/logo" -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -d '{"image_url":"https://verait.de/assets/logo-black.png"}'

curl -X PUT "$BASE/company/cover" -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -d '{"image_url":"https://example.com/cover-portrait-1200x1400.jpg"}'
```

Cover must be **1200 × 1400 px** portrait (6∶7). Wide banners and logos will be cropped badly.

```bash
# wrong — 1200×630 OG / website banner
# right — 1200×1400 vertical team/office/project photo

## 2. Case studies (4 projects)

For each project:

1. `POST /case-studies` — title, summary, challenge, outcome
2. `PUT /case-studies/{id}/cover` — project hero image (**PUT**, not POST)
3. `PUT /case-studies/{id}/gallery` — additional photos if needed
4. `POST /client-confirmations` — `{ "case_study_slug": "...", "email": "client@..." }`

## 3. References

```bash
curl -X POST "$BASE/references" -H "Authorization: Bearer $KEY" \
  -d '{"client_name":"ReinAllround GmbH","service":"KI-first Plattform","started_year":"2024"}'

curl -X POST "$BASE/references/{id}/invite" -H "Authorization: Bearer $KEY" \
  -d '{"email":"info@reinallround.de"}'
```

## 4. Verification

```bash
curl "$BASE/verification/instructions?method=meta_tag" -H "Authorization: Bearer $KEY"
# Add html_head_example to verait.de — outside Hansala scope
curl -X POST "$BASE/verification/check" -H "Authorization: Bearer $KEY" \
  -d '{"method":"meta_tag"}'
```

## 5. Partners

```bash
curl -X POST "$BASE/partner-invites" -H "Authorization: Bearer $KEY" \
  -d '{"company_name":"ReinAllround GmbH","email":"info@reinallround.de"}'

curl -X POST "$BASE/case-studies/{id}/partners" -H "Authorization: Bearer $KEY" \
  -d '{"partner_company_slug":"reinallround","role":"Platform partner"}'
```

## Smoke test

```bash
node scripts/agent-smoke-test.mjs
```

Requires `HANSALA_AGENT_API_KEY` and optional `HANSALA_API_BASE`.
