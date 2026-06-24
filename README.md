# WealthPilot

Selector-first Next.js app for stock, portfolio, and options analysis.

## Current State

- Runs locally with Prisma + SQLite persistence.
- Deploys to Vercel prod with Neon/Postgres persistence.
- Protected by a custom sign-in screen with middleware-gated cookie session auth.
- Uses deterministic scoring first, with optional LLM memo generation on top.

## Core Workflows

- `Research This Ticker`
- `Scan My Portfolio`
- `Income / Options Ideas`
- `Full PM Review`

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Alpha Vantage adapters with mock fallback
- Optional OpenAI / OpenAI-compatible memo providers

## Local Setup

1. Run `npm install`
2. Copy `.env.example` to `.env`
3. Set `PRIVATE_ACCESS_USERNAME`, `PRIVATE_ACCESS_PASSWORD`, and `SESSION_SECRET`
4. Run `npm run prisma:generate`
5. Run `npm run db:push`
6. Run `npm run dev`

By default, local persistence writes to `prisma/dev.db`.
If old `db/storage/*.json` files exist, the app imports them into SQLite on first local use.

## Vercel Setup

See [DEPLOY.md](./DEPLOY.md).

## Important Env Vars

- `PRIVATE_ACCESS_USERNAME`
- `PRIVATE_ACCESS_PASSWORD`
- `SESSION_SECRET`
- `DATA_PROVIDER`
- `OPENAI_API_KEY`
- `LLM_API_KEY`
- `LLM_BASE_URL`
- `ALPHA_VANTAGE_API_KEY`
- `ALPHA_VANTAGE_BASE_URL`
- `STORAGE_DRIVER`
- `DATABASE_URL`

## Auth Model

- users sign in with `PRIVATE_ACCESS_USERNAME` and `PRIVATE_ACCESS_PASSWORD`
- the server validates those credentials and issues an `HttpOnly` session cookie
- `SESSION_SECRET` is server-only and signs the cookie; it is not entered in the browser
- if `SESSION_SECRET` changes, existing sessions become invalid and users must sign in again
- if any of the three auth env vars are missing, the app falls back to the existing config-error path

## Persistence Mode

- Local default: Prisma + SQLite at `prisma/dev.db`
- Vercel prod default: Postgres via `DATABASE_URL`
- Override manually with `STORAGE_DRIVER=sqlite` or `STORAGE_DRIVER=postgres`
- Legacy local JSON data under `db/storage/` is imported into SQLite on first local read/write while the SQLite tables are still empty.

## Status

- Vercel readiness: ready once Vercel env vars are set
- Private access: shipped
- Local development: working
- Main remaining product work: broader market-data coverage and richer persistence depth

See [STATUS.md](./STATUS.md) and [PROJECT_STATUS.md](./PROJECT_STATUS.md) for current project notes.
