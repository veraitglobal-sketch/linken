# Partnership lifecycle

## Statuses

`pending` → `accepted` | `rejected` | `cancelled`

- **Withdraw** (`withdraw_partnership`): requester only, `pending` → `cancelled`
- **End** (`end_partnership`): either party, `accepted` → `cancelled` (unilateral)
- Accept / decline: unchanged app flow; decline writes DB value `rejected`

## Re-request after cancel

Unique constraint is directional `(requester_id, recipient_id)`.

`requestPartnership` does **not** INSERT a second row. If a cancelled/rejected
row exists for the pair (either direction), it **UPDATEs** that row back to
`pending` with the new requester/recipient orientation. Documented in
`src/features/network/partnership-request.ts`.

## Display / trust

Public profile, network map, logo wall, trust score, and public API partner
lists filter `status = 'accepted'` only — ended partnerships drop out
automatically. Case study partner tags (`case_study_partners`) are separate
history and are **not** cleared on end.
