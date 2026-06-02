# Private Vercel Deploy

## Local

1. Copy `.env.example` to `.env`.
2. Set `PRIVATE_ACCESS_USERNAME` and `PRIVATE_ACCESS_PASSWORD`.
3. Leave `STORAGE_DRIVER=auto` unless you intentionally want Postgres locally.
4. Run `npm run prisma:generate`.
5. Run `npm run db:push`.
6. Run `npm run dev`.

Local dev uses Prisma + SQLite at `prisma/dev.db` unless you force `STORAGE_DRIVER=postgres`.

## Vercel

1. Import the repo into Vercel as a standard Next.js project.
2. Add `PRIVATE_ACCESS_USERNAME` and `PRIVATE_ACCESS_PASSWORD`.
3. Set `DATABASE_URL` to your Neon Postgres connection string.
4. Leave `STORAGE_DRIVER=auto` so local stays SQLite and Vercel uses Postgres automatically.

If `DATABASE_URL` is missing in Vercel, persistence routes will fail.

## Quick Verification

1. Open the site and confirm it redirects to `/signin`.
2. Save a profile or portfolio.
3. Refresh and confirm the saved data still loads.
