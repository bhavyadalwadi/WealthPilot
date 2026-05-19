# Repo Semantic Summary - ticker-pm-copilot

Generated: 2026-05-19 21:48 UTC

## What This Repo Is For
Selector-first Next.js app for stock, portfolio, and options analysis that combines deterministic scoring with PM-style memo generation.

## Snapshot
- Domains: finance, ai, web app
- Tech stack: Next.js, React, TypeScript, OpenAI-compatible APIs, Alpha Vantage
- Pending state: documented
- Status confidence: high
- Current work guess: The current product direction is better data-provider breadth plus stronger persistence and memo-provider flexibility.
- Graph stats: 384 nodes · 759 edges · 15 communities (13 shown, 2 thin omitted)

## Features
- Selector-driven workflows for ticker research, portfolio scan, income ideas, and full PM review
- Intent-aware forms and API routes with typed validation and normalized analysis payloads
- Deterministic factor scoring, policy gates, ranking, and action mapping behind the UI
- Configurable PM memo generation through mock, OpenAI, and OpenAI-compatible provider paths
- Live-capable Alpha Vantage adapters for market, news, earnings, and options context with local persistence support

## Pending
- Add an additional live provider path beyond Alpha Vantage so options data is not dependent on a premium-only endpoint
- Add more LLM vendor adapters beyond the current OpenAI-compatible path
- Persist saved portfolios, user defaults, and analysis history more fully

## Read First
- `README.md`
- `PLAN.md`
- `lib/data/service.ts`
- `lib/ai`

## Likely Entrypoints
- `README.md`
- `PLAN.md`
- `app`
- `lib/data/service.ts`

## Main Modules
- `app`
- `components`
- `lib`
- `db`
- `node_modules`

## Conservative Suggestions
- Add another live market/options provider path
- Expand LLM vendor support beyond the current provider set
- Deepen persistence for saved portfolio and analysis workflows

## Evidence Files
- `README.md`
- `PLAN.md`

## Graph Signals
- God nodes: compilerOptions, generateMockAnalysis(), validateRequest(), handleAnalysisRequest(), Northstar PM Copilot Build Plan
