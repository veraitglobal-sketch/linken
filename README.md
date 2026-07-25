# Hansala

Company profiles with case studies and mutually confirmed partners.

## Local setup

```bash
cp .env.example .env.local
# Fill Supabase + Resend values from .env.example checklist
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production env (Vercel)

Required:

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://hansala.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (or publishable key) |
| `SUPABASE_SERVICE_ROLE_KEY` | Verification, claim tokens, notify emails |
| `RESEND_API_KEY` | Required in production — missing key fails sends |
| `RESEND_FROM_EMAIL` | Verified domain, e.g. `Hansala <noreply@hansala.com>` |

Also set Supabase Auth redirect URL: `https://hansala.com/auth/callback`.

Functions deploy to **fra1** via [`vercel.json`](vercel.json).

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
node scripts/check-live-env.mjs          # local keys
node scripts/check-live-env.mjs --prod   # production-shaped checks
```
