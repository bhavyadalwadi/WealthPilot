# Analysis Ui

## Responsibility
Collect selector inputs, validate request shape, and present PM-style analysis outputs.

## Dependencies
- Next.js
- React
- TypeScript
- OpenAI-compatible APIs
- Alpha Vantage

## Inbound APIs
- typed analysis route handlers under `app`
- OpenAI-compatible memo provider calls
- Alpha Vantage HTTP calls via provider adapters

## Outbound APIs
- typed analysis route handlers under `app`
- OpenAI-compatible memo provider calls
- Alpha Vantage HTTP calls via provider adapters

## Databases Used
- No database visible.

## Queues / Topics
- parallel provider fetches per ticker
- memo generation after deterministic analysis payload construction

## Critical Workflows
- ticker, portfolio, income, and full analysis entry flows
- memo display and action mapping

## Failure Modes
- provider completeness varies; missing premium options data can degrade downstream analysis quality
- cached ticker data can hide provider drift for five minutes
- fallback to mock providers is useful locally but can mask missing production env wiring

## Scaling Concerns
- scale pressure will show up first in the stateful/data boundary
- no heavyweight horizontal scaling layer is visible from the repo docs

## Operational Concerns
- validate environment and schema prerequisites before changing behavior
- use the repo-local docs in `.claude/` plus Graphify entrypoints before editing

## Important Source Files
- `README.md`
- `PLAN.md`
- `app`
- `lib/data/service.ts`
- `README.MD`
- `Plan.md`

## Dangerous Code Paths
- provider completeness varies; missing premium options data can degrade downstream analysis quality
- cached ticker data can hide provider drift for five minutes
- fallback to mock providers is useful locally but can mask missing production env wiring

## Testing Strategy
- `npm run typecheck`
- `npm run lint`

## Known Technical Debt
- Add an additional live provider path beyond Alpha Vantage so options data is not dependent on a premium-only endpoint
- Add more LLM vendor adapters beyond the current OpenAI-compatible path
- Persist saved portfolios, user defaults, and analysis history more fully
