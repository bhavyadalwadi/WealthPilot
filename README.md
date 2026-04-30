# Northstar PM Copilot

Selector-first Next.js app for a hedge-fund-style stock, portfolio, and options decision workspace.

## What this build does

- Lets the user choose a primary workflow:
  - `Research This Ticker`
  - `Scan My Portfolio`
  - `Income / Options Ideas`
  - `Full PM Review`
- Lets the user choose a decision intent:
  - buy
  - add
  - trim/sell
  - average down
  - breakout
  - covered call
  - CSP
- Adapts the input form, recommendation emphasis, and generated Codex prompt.
- Serves normalized mock JSON analysis from Next.js API routes with request validation.
- Produces a lightweight decision board and a structured prompt contract for later live-data integration.

## Key folders
- `app/` — App Router pages, global styles, and API routes
- `components/` — layout, selectors, forms, and results UI
- `lib/` — mode config, schemas, scoring modules, and server helpers
- `lib/data/` — normalized snapshot types, provider adapters, cache, and composed data service
- `lib/ai/` — provider-agnostic memo generation, prompt building, and LLM adapters
- `lib/server/` — shared request validation and route response helpers
- `PLAN.md` — implementation roadmap

## Run

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`

## Next build step

Next steps after the current deterministic-engine pass:

1. Market data ingestion
2. Earnings/news/options data connectors
3. Live provider swaps for the mock adapters
4. Additional LLM vendors beyond the current OpenAI-compatible path
