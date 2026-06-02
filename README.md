# WealthPilot

Selector-first Next.js app for stock, portfolio, and options analysis.

## Current State

- Runs locally with file-backed persistence.
- Deploys to Vercel with KV-backed persistence.
- Protected by site-wide HTTP Basic Auth in both local and Vercel.
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
2. Copy `.env.local.example` to `.env.local`
3. Set `PRIVATE_ACCESS_USERNAME` and `PRIVATE_ACCESS_PASSWORD`
4. Run `npm run dev`

By default, local persistence writes to `db/storage/`.

## Vercel Setup

See [DEPLOY.md](./DEPLOY.md).

## Important Env Vars

- `PRIVATE_ACCESS_USERNAME`
- `PRIVATE_ACCESS_PASSWORD`
- `DATA_PROVIDER`
- `OPENAI_API_KEY`
- `LLM_API_KEY`
- `LLM_BASE_URL`
- `ALPHA_VANTAGE_API_KEY`
- `ALPHA_VANTAGE_BASE_URL`
- `STORAGE_DRIVER`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

## Persistence Mode

- Local default: file storage under `db/storage/`
- Vercel default: KV storage through REST env vars
- Override manually with `STORAGE_DRIVER=file` or `STORAGE_DRIVER=kv`

## Status

- Vercel readiness: ready once Vercel env vars are set
- Private access: shipped
- Local development: working
- Main remaining product work: broader market-data coverage and richer persistence depth

See [STATUS.md](./STATUS.md) and [PROJECT_STATUS.md](./PROJECT_STATUS.md) for current project notes.
