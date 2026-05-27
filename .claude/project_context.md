# ticker-pm-copilot Project Context

Generated: 2026-05-27 01:50 UTC

## Business Purpose
Selector-first Next.js app for stock, portfolio, and options analysis that combines deterministic scoring with PM-style memo generation.

## System Overview
This repo centers on Next.js selector-first analysis UI, provider-backed market/news/earnings/options data layer, memo generation layer using OpenAI-compatible APIs.

## Major Applications
- Next.js selector-first analysis UI
- provider-backed market/news/earnings/options data layer
- memo generation layer using OpenAI-compatible APIs

## Environments
- local development
- production-like deployment only when explicitly documented in README/infra files

## Tech Stack
- Next.js
- React
- TypeScript
- OpenAI-compatible APIs
- Alpha Vantage

## Critical Dependencies
- `@types/node`
- `@types/react`
- `@types/react-dom`
- `next`
- `react`
- `react-dom`
- `typescript`

## Major Workflows
- Selector-driven workflows for ticker research, portfolio scan, income ideas, and full PM review
- Intent-aware forms and API routes with typed validation and normalized analysis payloads
- Deterministic factor scoring, policy gates, ranking, and action mapping behind the UI
- Configurable PM memo generation through mock, OpenAI, and OpenAI-compatible provider paths
- Live-capable Alpha Vantage adapters for market, news, earnings, and options context with local persistence support

## Operational Constraints
- provider completeness varies; missing premium options data can degrade downstream analysis quality
- cached ticker data can hide provider drift for five minutes
- fallback to mock providers is useful locally but can mask missing production env wiring

## Scaling Constraints
- This repo has active product or operational intent; changes should assume future iteration rather than a one-off snapshot.

## Deployment Model
Next.js app with environment-selected provider strategy and optional live Alpha Vantage use.

## Important APIs
- typed analysis route handlers under `app`
- OpenAI-compatible memo provider calls
- Alpha Vantage HTTP calls via provider adapters

## Important Databases
- No dedicated database is visible from the inspected files.

## Important Queues / Events
- parallel provider fetches per ticker
- memo generation after deterministic analysis payload construction

## Known Technical Debt
- Add an additional live provider path beyond Alpha Vantage so options data is not dependent on a premium-only endpoint
- Add more LLM vendor adapters beyond the current OpenAI-compatible path
- Persist saved portfolios, user defaults, and analysis history more fully

## Current Architecture Themes
- Tier A repo under the `_personal` workspace
- Graphify-first repository discovery
- preserve current architecture instead of speculative rewrites
