# Status

## Current Phase

Vercel-ready private MVP.

## Shipped

- Next.js app with selector-first workflows
- Typed API routes for ticker, portfolio, income, and full review flows
- Deterministic scoring, policy, and ranking modules
- Optional memo generation through `mock`, `openai`, and `openai-compatible`
- Saved profile, portfolios, and recent history persistence
- Site-wide HTTP Basic Auth gate
- Storage split:
  - local uses `db/storage/`
  - Vercel uses KV via REST env vars

## Verified In This Pass

- `npm run typecheck`
- `npm run build`

## Vercel Blockers Closed

- Removed dependence on durable local filesystem writes in production
- Added deploy-time env contract for private access and KV-backed persistence

## Remaining Work

- Add another live data provider beyond Alpha Vantage
- Expand persistence depth only if product needs it
- Improve docs or UX further as separate work

## Operational Notes

- The app now fails closed if private-access env vars are missing
- Vercel persistence requires `KV_REST_API_URL` and `KV_REST_API_TOKEN`
- Local development does not require KV unless `STORAGE_DRIVER=kv`

## Last Updated

2026-06-02
