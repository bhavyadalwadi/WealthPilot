# Northstar PM Copilot Build Plan

## Objective

Turn the current static prototype into a production-ready React/Next.js application with:

- selector-driven stock, portfolio, and options workflows
- API routes and stable JSON response contracts
- market, news, earnings, and options data ingestion
- OpenAI-generated PM-style investment memos on top of deterministic scoring

This document captures the product direction, implementation order, folder structure, interfaces, and delivery steps discussed so far.

## Product Scope

The app remains intent-first.

Primary workflows:
- `Research This Ticker`
- `Scan My Portfolio`
- `Income / Options Ideas`
- `Full PM Review`

Decision intents:
- `Should I buy this?`
- `Should I add more?`
- `Should I trim or sell?`
- `Should I average down?`
- `Is this a breakout?`
- `Is this good for covered calls?`
- `Should I sell a CSP instead?`

The user should provide minimal context:
- ticker
- optional ownership context
- optional shares / avg cost / cash
- optional portfolio and watchlist
- optional objective and risk style

The system should infer and fetch the rest:
- thesis context
- price action
- support / resistance
- earnings / catalysts
- news / sentiment
- options context
- portfolio fit
- CC / CSP / PMCC suitability

## Build Order

### Phase 1: Framework Migration

Move the static MVP into a Next.js app with:

- App Router
- TypeScript
- modular components
- server-side API handlers
- reusable design tokens and layout system

Deliverables:
- working Next.js app shell
- selector-driven home page
- mode-aware forms
- results surface migrated from the static prototype

### Phase 2: API Contracts

Add internal API routes for:

- ticker analysis requests
- portfolio analysis requests
- options-income analysis requests
- full PM review requests

Deliverables:
- typed request/response schemas
- mock service layer behind the routes
- deterministic validation for malformed inputs

### Phase 3: Deterministic Analysis Engine

Replace local UI heuristics with backend analysis services:

- factor scoring
- policy gates
- action label mapping
- recommendation ranking

Deliverables:
- score engine module
- action policy module
- ranking utilities
- structured recommendation payloads

Status:
- Completed with dedicated `factor-scores`, `policy-engine`, and `ranking` modules
- API response shape preserved while business logic was separated internally

### Phase 4: Data Layer

Add provider adapters for:

- market price/history data
- earnings calendar
- company/news data
- options chain / IV / flow context

Deliverables:
- provider abstraction layer
- normalized ticker snapshot object
- caching strategy
- graceful fallback when providers fail or data is incomplete

Status:
- In progress via live-capable Alpha Vantage market/news/earnings/options adapters with mock fallback
- Scoring and policy now consume normalized snapshot context instead of raw request text alone

### Phase 5: OpenAI Memo Generation

Use OpenAI to convert structured analysis into a PM-style investment brief.

Deliverables:
- prompt builder
- structured analysis-to-memo transformer
- response guardrails so the model only uses approved action labels
- clear missing-data caveat handling

Status:
- Implemented as a configurable LLM layer rather than an OpenAI-only hardcode
- Current providers: `mock`, `openai`, and `openai-compatible`
- Deterministic scoring and policy remain authoritative; the LLM only writes the memo

### Phase 6: Portfolio Persistence

Add local persistence for:

- user profile defaults
- saved portfolios
- watchlists
- recent analyses

Deliverables:
- database schema
- CRUD APIs
- saved workflow state

Status:
- Implemented as pragmatic persistence with environment-based storage mode selection
- Local development uses file-backed persistence under `db/storage/`
- Vercel uses KV-backed persistence via REST env vars
- Added profile defaults, saved portfolio CRUD, and automatic analysis history capture

### Phase 7: Private Deployment Baseline

Add a simple private-access layer and close deployment blockers for Vercel.

Deliverables:
- site-wide username/password gate
- production-safe persistence path
- minimal deploy documentation

Status:
- Completed with middleware-based HTTP Basic Auth
- Completed with Vercel-ready KV persistence fallback
- Completed with local/Vercel setup notes in `DEPLOY.md`

## Recommended Folder Structure

```text
ticker-pm-copilot/
  app/
    layout.tsx
    page.tsx
    globals.css
    api/
      analyze/
        route.ts
      portfolio/
        route.ts
      income/
        route.ts
      review/
        route.ts
  components/
    layout/
      app-shell.tsx
      side-rail.tsx
      hero-panel.tsx
    selectors/
      mode-selector.tsx
      intent-selector.tsx
    forms/
      ticker-form.tsx
      portfolio-form.tsx
      income-form.tsx
      review-form.tsx
    results/
      summary-bar.tsx
      decision-card.tsx
      signal-card.tsx
      action-queue.tsx
      prompt-card.tsx
      options-card.tsx
  lib/
    config/
      modes.ts
      intents.ts
      action-labels.ts
    schemas/
      analysis.ts
      portfolio.ts
      recommendation.ts
    scoring/
      factor-scores.ts
      policy-engine.ts
      ranking.ts
    data/
      providers/
        market.ts
        news.ts
        earnings.ts
        options.ts
      normalize/
        ticker-snapshot.ts
        portfolio-snapshot.ts
      cache.ts
    ai/
      prompt-builder.ts
      memo-generator.ts
      output-guards.ts
    utils/
      numbers.ts
      parsing.ts
      dates.ts
  db/
    schema.ts
    queries.ts
  public/
  README.md
  PLAN.md
  package.json
  tsconfig.json
  next.config.ts
  .env.local.example
```

## API Routes And JSON Contracts

### `POST /api/analyze`

Use for `Research This Ticker`.

Request:

```json
{
  "mode": "ticker",
  "intent": "Should I buy this?",
  "ticker": "NVDA",
  "ownIt": true,
  "shares": 100,
  "avgCost": 118.5,
  "cash": 5000,
  "riskStyle": "Balanced",
  "timeHorizon": "Position",
  "notes": "Worried about chasing after a strong run."
}
```

Response:

```json
{
  "ticker": "NVDA",
  "posture": "Constructive",
  "action": "Hold / Wait",
  "confidence": "Medium",
  "urgency": "Watch",
  "score": 68,
  "factors": {
    "thesis": 78,
    "technicals": 64,
    "catalysts": 58,
    "portfolioFit": 70,
    "optionsSuitability": 52
  },
  "levels": {
    "support": [],
    "resistance": [],
    "breakout": null,
    "breakdownRisk": null
  },
  "recommendationSummary": "",
  "memo": ""
}
```

### `POST /api/portfolio`

Use for `Scan My Portfolio`.

Request:

```json
{
  "mode": "portfolio",
  "intent": "Should I add more?",
  "positions": [
    { "ticker": "AAPL", "shares": 100, "avgCost": 174.2 },
    { "ticker": "AMD", "shares": 75, "avgCost": 162.5 }
  ],
  "watchlist": ["AMZN", "META"],
  "cash": 20000,
  "objective": "Balanced",
  "riskStyle": "Conservative",
  "constraints": "Max 10% per position."
}
```

Response:

```json
{
  "overallPosture": "Neutral",
  "topActions": [],
  "holdings": [],
  "watchlist": [],
  "capitalDeploymentPlan": [],
  "riskFlags": [],
  "memo": ""
}
```

### `POST /api/income`

Use for `Income / Options Ideas`.

Request:

```json
{
  "mode": "income",
  "intent": "Is this good for covered calls?",
  "ticker": "PLTR",
  "ownIt": true,
  "shares": 200,
  "avgCost": 19.3,
  "cash": 3000,
  "incomeGoal": "Monthly yield",
  "riskStyle": "Conservative",
  "notes": "Do not want to cap too much upside into earnings."
}
```

Response:

```json
{
  "ticker": "PLTR",
  "bestStrategy": "Covered Call Candidate",
  "alternatives": [],
  "cancellationConditions": [],
  "optionsContext": {
    "ivState": "",
    "earningsRisk": "",
    "assignmentRisk": ""
  },
  "memo": ""
}
```

### `POST /api/review`

Use for `Full PM Review`.

Request combines the portfolio, watchlist, deep-dive tickers, cash, risk style, and notes.

Response includes:
- executive PM view
- highest-priority actions
- holdings review
- watchlist opportunities
- deep-dive ticker sections
- covered call / CSP / PMCC candidates
- capital deployment plan
- final PM summary

## Core Types

### `PortfolioPosition`

```ts
type PortfolioPosition = {
  ticker: string;
  shares: number;
  avgCost: number;
};
```

### `AnalysisRequest`

```ts
type AnalysisRequest = {
  mode: "ticker" | "portfolio" | "income" | "full";
  intent: string;
  ticker?: string;
  ownIt?: boolean;
  shares?: number;
  avgCost?: number;
  cash?: number;
  riskStyle?: "Conservative" | "Balanced" | "Aggressive";
  timeHorizon?: "Swing" | "Position" | "Long-term";
  objective?: "Growth" | "Income" | "Balanced";
  incomeGoal?: string;
  notes?: string;
  positions?: PortfolioPosition[];
  watchlist?: string[];
  priorityTickers?: string[];
  constraints?: string;
};
```

### `Recommendation`

```ts
type Recommendation = {
  ticker: string;
  action:
    | "Strong Buy"
    | "Buy"
    | "Buy Small"
    | "Add"
    | "Hold"
    | "Hold / Wait"
    | "Trim"
    | "Sell Partial"
    | "Sell"
    | "Avoid"
    | "Covered Call Candidate"
    | "Cash-Secured Put Candidate"
    | "Poor Man's Covered Call Candidate"
    | "No Action";
  confidence: "High" | "Medium" | "Low";
  urgency: "Now" | "Soon" | "Watch" | "Avoid for now";
  whyNow: string;
  invalidation: string;
  scoreBreakdown: Record<string, number>;
};
```

## Scoring Engine

The scoring engine should be deterministic and sit behind the LLM.

Factor buckets:
- `thesisScore`
- `technicalScore`
- `catalystScore`
- `sentimentFlowScore`
- `portfolioFitScore`
- `optionsSuitabilityScore`
- `riskPenalty`

Intent-specific weighting:
- buy: thesis and technicals highest
- add: technicals and portfolio fit highest
- trim/sell: technical weakness and risk highest
- average down: thesis integrity and support quality highest
- breakout: structure and confirmation highest
- covered call: options suitability and capped-upside environment highest
- CSP: desired entry, support below spot, and cash-readiness highest

Hard policy gates:
- no average-down if thesis is weakening into elevated catalyst risk
- no covered call if major upside catalyst is imminent
- no CSP without available cash and willingness to own shares
- no PMCC unless liquidity, trend quality, and complexity tolerance pass
- no aggressive add if concentration limits are already breached

## Data Layer

Add an adapter-based provider layer so providers can change without rewriting the analysis engine.

Required normalized inputs:
- spot price
- price history
- volume profile
- moving averages / momentum inputs
- earnings date and recent earnings summary
- company/news summary
- sentiment summary
- options chain summary
- IV regime
- flow / unusual activity summary if available

Provider responsibilities:
- `market.ts`: quote, chart, trend inputs
- `earnings.ts`: earnings calendar and prior event context
- `news.ts`: headlines and sentiment summaries
- `options.ts`: IV, chain summary, and income-strategy suitability inputs

Fallback behavior:
- missing provider data should not crash the run
- API responses should include missing-data flags
- memo generator should explicitly state uncertainty when data is incomplete

## OpenAI Integration

Use OpenAI after deterministic analysis is complete.

The model should:
- explain structured scores and tradeoffs
- write the PM-style memo
- surface missing-data caveats
- keep recommendations within allowed action labels

The model should not:
- invent unsupported market data
- override hard policy gates
- drift into vague or generic stock commentary

Prompt pipeline:
1. request validated
2. provider data normalized
3. factor scores calculated
4. action policy determined
5. structured context sent to OpenAI
6. memo returned and attached to API response

Expected environment variables:
- `OPENAI_API_KEY`
- provider-specific API keys once selected

## UI Requirements

Main page:
- side rail for mode and intent
- hero panel with current workflow
- adaptive form
- results board with:
  - summary bar
  - action card
  - factor score card
  - signal / risk gates
  - action queue
  - PM memo

The selector should control:
- visible form fields
- API request payload shape
- scoring emphasis
- output card ordering

## Immediate Next Steps

1. Create the Next.js app in this folder and migrate the static UI into React components.
2. Add TypeScript types and schemas for the four request flows.
3. Build `/api/analyze`, `/api/portfolio`, `/api/income`, and `/api/review` with mock JSON responses.
4. Move the local heuristic engine from `app.js` into server-side library modules.
5. Add an OpenAI memo generator behind the mock deterministic response.
6. Replace mock data with real provider adapters for market, news, earnings, and options data.

## Current State

Current files:
- `index.html`
- `styles.css`
- `app.js`
- `README.md`

Current app status:
- selector-first static prototype exists
- local heuristic scoring exists
- generated Codex prompt exists
- no real backend, persistence, live data, or LLM integration yet
