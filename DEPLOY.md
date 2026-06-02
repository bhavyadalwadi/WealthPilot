# Private Vercel Deploy

## Local

1. Copy `.env.local.example` to `.env.local`.
2. Set `PRIVATE_ACCESS_USERNAME` and `PRIVATE_ACCESS_PASSWORD`.
3. Leave `STORAGE_DRIVER=auto` unless you intentionally want KV locally.
4. Run `npm run dev`.

Local dev uses file storage under `db/storage/` unless you force `STORAGE_DRIVER=kv`.

## Vercel

1. Import the repo into Vercel as a standard Next.js project.
2. Add `PRIVATE_ACCESS_USERNAME` and `PRIVATE_ACCESS_PASSWORD`.
3. Create a Vercel KV store and add `KV_REST_API_URL` plus `KV_REST_API_TOKEN`.
4. Leave `STORAGE_DRIVER=auto` so local stays file-backed and Vercel uses KV automatically.

If the KV env vars are missing in Vercel, persistence routes will fail fast instead of silently writing to ephemeral disk.

## Quick Verification

1. Open the site and confirm the browser prompts for credentials.
2. Save a profile or portfolio.
3. Refresh and confirm the saved data still loads.
