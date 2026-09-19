# Task: "Connect" with sign-in for the Hansala MCP connector (OAuth 2.1)

Paste this whole file into Cursor. Read `AGENTS.md` first — its security rules apply.

## Goal

In Claude (Settings → Connectors → Add custom connector → `https://www.hansala.com/api/mcp`)
clicking **Connect** must:

1. open hansala.com in the browser,
2. send the person to `/login` if they are not signed in, then come back,
3. show a consent screen: "Allow Claude to manage **{company}** on Hansala?" with Allow / Cancel,
4. return to Claude connected — Claude then calls `/api/mcp` with a Bearer token.

Today Claude shows *"Couldn't register with hansala's sign-in service"* because there is no
OAuth metadata, registration or authorize endpoint.

## What exists (do not rewrite)

- `src/app/api/mcp/route.ts` — remote MCP server (Streamable HTTP, JSON responses, stateless).
  Without a Bearer it serves 3 public tools; with `Authorization: Bearer hs_…` it also serves
  the Agent tools and forwards the key to `/api/v1/agent/*`. Tool code is imported from
  `mcp/hansala/*` and `mcp/hansala-public/*`.
- Agent API keys: table `public.api_keys` (`key_hash` sha256, `key_prefix`, `scopes text[]`,
  `company_id`, `revoked_at`), RPCs `create_api_key` / `revoke_api_key`
  (`supabase/migrations/20260719232736_agent_api_keys.sql` + later scope migrations).
  Helpers: `generateApiKey()`, `hashApiKey()` in `src/features/agent-api/auth.ts`;
  scopes in `src/features/agent-api/types.ts` (`AGENT_SCOPES`, presets).
- Agent API and MCP are free on every plan. Website widgets still need `premiumEmbeds`. Outbound webhooks stay Pro (`isPaidPlan`).
- Login redirect: `/login?next=<path>` (`safeNext` accepts paths starting with `/`, not `//`).

## Design (follow exactly)

The OAuth **access token is a normal Hansala Agent API key** (`hs_…`), created for the chosen
company, named `Claude connector` (use the registered `client_name`). So `/api/mcp` and the Agent
API need no new auth path, and the person can revoke it in **Dashboard → API** like any key.
No refresh tokens; do not send `expires_in`.

### 1. Split public and signed-in URLs

- Move today's keyless behaviour to **`/api/mcp/public`** (same 3 public tools, no auth ever).
- **`/api/mcp`**: if there is no valid Bearer → respond **401** with
  `WWW-Authenticate: Bearer resource_metadata="https://<origin>/.well-known/oauth-protected-resource/api/mcp"`
  (JSON-RPC body is fine). With a Bearer: validate it (hash → `api_keys`, not revoked); invalid →
  401 with `WWW-Authenticate: Bearer error="invalid_token", resource_metadata="…"`. Valid → current
  behaviour (public + agent tools). Keep `OPTIONS`/CORS and expose `WWW-Authenticate`.
- Update `src/components/integrations/mcp-connect-card.tsx`: Claude tab = `/api/mcp` with
  "Connect → sign in to Hansala → Allow"; add a small line with the public link for keyless use.

### 2. Metadata endpoints (Route Handlers, JSON, CORS `*`)

- `src/app/.well-known/oauth-protected-resource/route.ts` **and**
  `src/app/.well-known/oauth-protected-resource/[...path]/route.ts`:
  ```json
  { "resource": "<origin>/api/mcp", "authorization_servers": ["<origin>"],
    "scopes_supported": ["mcp"], "bearer_methods_supported": ["header"] }
  ```
- `src/app/.well-known/oauth-authorization-server/route.ts` (+ `[...path]` variant):
  ```json
  { "issuer": "<origin>",
    "authorization_endpoint": "<origin>/oauth/authorize",
    "token_endpoint": "<origin>/api/oauth/token",
    "registration_endpoint": "<origin>/api/oauth/register",
    "response_types_supported": ["code"],
    "grant_types_supported": ["authorization_code"],
    "code_challenge_methods_supported": ["S256"],
    "token_endpoint_auth_methods_supported": ["none"],
    "scopes_supported": ["mcp"] }
  ```
- Use `https://www.hansala.com` as origin in production (apex 308-redirects to www and a redirect
  drops `Authorization`); request origin locally.
- Make sure these paths are not caught by the `(site)/[slug]` page and not blocked by `src/proxy.ts`.

### 3. Migration `supabase/migrations/<timestamp>_mcp_oauth.sql` (new file, never edit old ones)

Pattern: `20260719270000_domain_verification.sql` — RLS on, no public grants,
`security definer` RPCs, `revoke all … from public`, `grant execute … to service_role`.

```sql
create table public.oauth_clients (
  client_id text primary key,
  client_name text not null default 'MCP client',
  redirect_uris text[] not null,
  created_at timestamptz not null default now()
);
create table public.oauth_authorization_codes (
  code_hash text primary key,              -- sha256 of the code; raw code never stored
  client_id text not null references public.oauth_clients(client_id) on delete cascade,
  user_id uuid not null,
  company_id uuid not null references public.companies(id) on delete cascade,
  redirect_uri text not null,
  code_challenge text not null,            -- S256 only
  scope text not null default 'mcp',
  expires_at timestamptz not null,         -- now() + 10 minutes
  used_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.oauth_clients enable row level security;
alter table public.oauth_authorization_codes enable row level security;
revoke all on public.oauth_clients, public.oauth_authorization_codes from anon, authenticated;
```

RPCs (`security definer`, `set search_path = public`, service_role only):
- `oauth_register_client(p_client_id text, p_client_name text, p_redirect_uris text[])`
- `oauth_create_code(p_code_hash, p_client_id, p_user_id, p_company_id, p_redirect_uri, p_code_challenge, p_scope)`
- `oauth_consume_code(p_code_hash text, p_client_id text, p_redirect_uri text)` → returns
  `user_id, company_id, code_challenge, scope` and sets `used_at` **atomically**
  (`update … set used_at = now() where code_hash = … and used_at is null and expires_at > now()
  and client_id = … and redirect_uri = … returning …`). Zero rows → error.
- `oauth_issue_api_key(p_company_id, p_user_id, p_name, p_scopes, p_key_hash, p_key_prefix)` →
  inserts into `api_keys` (same checks as `create_api_key`, but called by the server after a
  consumed code; `created_by = p_user_id`).

Tell me to run `supabase db push` — do not run it yourself.

### 4. `POST /api/oauth/register` (RFC 7591 dynamic registration)

- Body JSON: `redirect_uris` (required, 1–5), `client_name` (optional, trim, ≤ 80 chars).
- Every redirect URI must be `https://…`, or `http://localhost:*` / `http://127.0.0.1:*`.
  Reject fragments, other schemes, > 500 chars.
- `client_id = "mcp_" + 24 random hex`. Store via `oauth_register_client`.
- Respond **201**: `client_id`, `client_id_issued_at`, `client_name`, `redirect_uris`,
  `grant_types: ["authorization_code"]`, `response_types: ["code"]`,
  `token_endpoint_auth_method: "none"`.
- Rate-limit by IP (reuse the pattern in `src/features/agent-api/rate-limit.ts`).

### 5. `GET /oauth/authorize` (page, `src/app/(auth)/oauth/authorize/page.tsx`)

- Required query: `response_type=code`, `client_id`, `redirect_uri`, `code_challenge`,
  `code_challenge_method=S256`; optional `state`, `scope`, `resource`.
- Invalid `client_id` or `redirect_uri` not in the client's list → show an error page,
  **never redirect** to an unregistered URI. Other invalid params → redirect back with
  `error=invalid_request&state=…`.
- Not signed in → `redirect("/login?next=" + encodeURIComponent("/oauth/authorize?" + originalQuery))`.
  Check the full query survives the login + OAuth callback round-trip.
- Signed in → consent screen in the site's style (same look as `/login`):
  client name, the companies where the user is **owner or admin** (select), what it can do
  ("Read and manage partners, case studies, testimonials, widgets, verification and team"),
  a line "You can disconnect any time in Dashboard → API", buttons **Allow** / **Cancel**.
- Company without Pro → explain "Managing your company from Claude is part of Pro", link to
  `/dashboard/billing`, only Cancel.
- Server action **Allow**: re-verify session, role (owner/admin) and plan server-side; create a
  random code (32 bytes hex), store its sha256 with `oauth_create_code`; redirect to
  `redirect_uri?code=…&state=…`. **Cancel** → `redirect_uri?error=access_denied&state=…`.

### 6. `POST /api/oauth/token`

- Accept `application/x-www-form-urlencoded` (and JSON). `grant_type=authorization_code`,
  `code`, `redirect_uri`, `client_id`, `code_verifier`.
- `oauth_consume_code(sha256(code), client_id, redirect_uri)`; verify
  `base64url(sha256(code_verifier)) === code_challenge` (constant-time compare).
- Re-check the company is still Pro and the user still owner/admin.
- `generateApiKey()` → `oauth_issue_api_key(..., scopes = AGENT_SCOPE_PRESETS.full_access)`.
- Respond `{ "access_token": "hs_…", "token_type": "Bearer", "scope": "mcp" }`,
  headers `Cache-Control: no-store`, `Pragma: no-cache`.
- Errors per RFC 6749: `invalid_grant`, `invalid_request`, `unsupported_grant_type` (400).

## Security checklist (must all hold)

- `createAdminClient` only in route handlers / server actions, never client components.
- Raw codes and keys are never stored or logged — hashes only.
- Codes: single use, 10-minute expiry, bound to client + redirect URI + PKCE.
- No open redirect: only exact registered redirect URIs.
- Consent requires a fresh server-side check of role and plan.
- Every token is a revocable row in `api_keys`, visible in Dashboard → API.

## Verify before handing back

1. `npx tsc --noEmit`, `npx eslint`, `npm run build`.
2. `curl -i -X POST localhost:3000/api/mcp -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'`
   → 401 with `WWW-Authenticate`.
3. `/api/mcp/public` → 200 and 3 tools.
4. Both `/.well-known/…` URLs return the JSON above.
5. Full flow locally with the MCP Inspector (`npx @modelcontextprotocol/inspector`,
   transport Streamable HTTP, URL `http://localhost:3000/api/mcp`): register → login → Allow →
   token → `tools/list` shows the agent tools.
6. Revoking the key in Dashboard → API makes `/api/mcp` return 401 again.
