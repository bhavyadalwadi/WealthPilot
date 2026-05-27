# ticker-pm-copilot Architecture

## End-to-End Request Flows
- Browser UI -> typed analysis route -> `lib/data/service.ts` -> provider bundle -> optional Alpha Vantage -> normalized snapshot -> memo generation

## Frontend / Backend Interaction
- API boundaries are repo-local; inspect the listed entrypoints before changing wire contracts

## Service Boundaries
- Next.js selector-first analysis UI
- provider-backed market/news/earnings/options data layer
- memo generation layer using OpenAI-compatible APIs

## Sync vs Async Flows
- parallel provider fetches per ticker
- memo generation after deterministic analysis payload construction

## Event-Driven Architecture
- No dedicated event bus, broker, or queue consumer layer is visible in the inspected files.

## Caching Layers
- repository-specific cache behavior is documented in repo docs
- Next.js build/runtime caching may affect server/client rendering behavior
- `MemoryCache` in `lib/data/service.ts` with a five-minute TTL for ticker snapshots

## Auth Flow
No first-party auth layer is visible in the inspected entrypoints.

## Deployment Topology
Next.js app with environment-selected provider strategy and optional live Alpha Vantage use.

## Scaling Behavior
- Active repo; scaling pressure will first appear in the data/API boundary rather than in broad service fan-out
- No autoscaling or multi-region story is visible unless infra files explicitly add one

## Resilience Mechanisms
- typed validation and repo-local guardrails where implemented
- manual fallbacks remain part of the operating model for many repos in this workspace

## Failover Behavior
- No formal failover topology is documented; failure handling is mostly local retries, manual restart, or degraded fallback.

## Observability Architecture
- console logs and local UI feedback are the default observability path

## Retry / Idempotency Patterns
- protect state-changing endpoints from duplicate actions where the repo explicitly calls this out
