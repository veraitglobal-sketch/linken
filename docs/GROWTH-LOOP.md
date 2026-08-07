# Product-led growth loop

Respectful invite → confirm → claim/create → invite-again.

## Principles

- No dark patterns
- No auto-created public profiles without consent (claim or explicit create)
- No auto-sent invites — `send_invite=1` required
- Public shows **confirmed** relationships only
- Referral attribution uses public company slug only (never emails)

## Flow

1. Company invites client/partner (explicit action)
2. Invitee confirms
3. Post-confirm success explains benefit and offers optional claim/create
4. Confirmed relationship appears on provider profile; on client profile as
   “Companies we work with” when `client_company_id` is set
5. New company can invite its own network

## Limits

| Control | Default |
|---------|---------|
| Unclaimed drafts / day | 10 |
| Invite emails / day | 20 |
| Reminder cooldown | 48 hours |
| Outreach toggle | `invite_reminders_enabled` on company |

## Key files

- `src/components/confirm/post-confirm-success.tsx`
- `src/features/growth/*`
- `src/features/references/providers-for-client.ts`
- `src/components/references/confirmed-providers-section.tsx`
- Migration `20260807120000_growth_outreach_referral.sql`

## Tests

`npm run test:growth`
