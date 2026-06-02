# Graph Report - ticker-pm-copilot  (2026-06-02)

## Corpus Check
- 79 files · ~81,980 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 555 nodes · 914 edges · 42 communities (29 shown, 13 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `19973819`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `ticker-pm-copilot Project Context` - 16 edges
3. `Project Status` - 15 edges
4. `Analysis Ui` - 15 edges
5. `Provider Layer` - 15 edges
6. `generateMockAnalysis()` - 14 edges
7. `ticker-pm-copilot Architecture` - 14 edges
8. `validateRequest()` - 13 edges
9. `handleAnalysisRequest()` - 13 edges
10. `Northstar PM Copilot Build Plan` - 13 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `listSavedPortfolios()`  [EXTRACTED]
  app/api/portfolios/route.ts → db/queries.ts
- `POST()` --calls--> `upsertSavedPortfolio()`  [EXTRACTED]
  app/api/portfolios/route.ts → db/queries.ts
- `DELETE()` --calls--> `deleteSavedPortfolio()`  [EXTRACTED]
  app/api/portfolios/[id]/route.ts → db/queries.ts
- `POST()` --calls--> `handleAnalysisRequest()`  [EXTRACTED]
  app/api/income/route.ts → lib/server/respond.ts
- `POST()` --calls--> `handleAnalysisRequest()`  [EXTRACTED]
  app/api/review/route.ts → lib/server/respond.ts

## Communities (42 total, 13 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.11
Nodes (25): ACTION_LABELS, ActionLabel, FullReviewRequest, IncomeRequest, OwnershipState, PortfolioRequest, TickerRequest, ValidationErrorResponse (+17 more)

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (22): buildAnalysisDataContext(), buildPortfolioSnapshot(), getDefaultProviders(), mockProviders, ProviderBundle, round(), tickerCache, uniqueTickers() (+14 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (39): LLM_FIELD_CONFIG, LLM_PROVIDER_OPTIONS, LLM_REASONING_OPTIONS, FIELD_CONFIG, INTENT_OPTIONS, MODE_CONFIG, ModeDefinition, defaults (+31 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (38): POST(), appendAnalysisHistory(), deleteSavedPortfolio(), getSavedPortfolio(), getUserProfile(), listAnalysisHistory(), listSavedPortfolios(), saveUserProfile() (+30 more)

### Community 5 - "Community 5"
Cohesion: 0.05
Nodes (36): `AnalysisRequest`, API Routes And JSON Contracts, Build Order, code:text (ticker-pm-copilot/), code:ts (type Recommendation = {), code:json ({), code:json ({), code:json ({) (+28 more)

### Community 6 - "Community 6"
Cohesion: 0.08
Nodes (46): generateMemo(), BaseAnalysisRequest, BaseAnalysisResponse, Confidence, FactorScores, FullReviewResponse, HoldingReview, IncomeAnalysisResponse (+38 more)

### Community 7 - "Community 7"
Cohesion: 0.1
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (18): dependencies, next, react, react-dom, devDependencies, @types/node, @types/react, @types/react-dom (+10 more)

### Community 9 - "Community 9"
Cohesion: 0.26
Nodes (9): buildMemoSystemPrompt(), buildMemoUserPrompt(), MemoInput, MemoProvider, MemoResult, MockMemoProvider, CompatibleConfig, OpenAICompatibleMemoProvider (+1 more)

### Community 10 - "Community 10"
Cohesion: 0.12
Nodes (16): Business Purpose, Critical Dependencies, Current Architecture Themes, Deployment Model, Environments, Important APIs, Important Databases, Important Queues / Events (+8 more)

### Community 11 - "Community 11"
Cohesion: 0.13
Nodes (14): Environment, Features, Key folders, License, LLM Start Here, Next build step, Persistence, Quick Repo Summary (+6 more)

### Community 15 - "Community 15"
Cohesion: 0.12
Nodes (15): Analysis Ui, Critical Workflows, Dangerous Code Paths, Databases Used, Dependencies, Failure Modes, Important Source Files, Inbound APIs (+7 more)

### Community 16 - "Community 16"
Cohesion: 0.12
Nodes (15): Critical Workflows, Dangerous Code Paths, Databases Used, Dependencies, Failure Modes, Important Source Files, Inbound APIs, Known Technical Debt (+7 more)

### Community 17 - "Community 17"
Cohesion: 0.13
Nodes (14): Auth Flow, Caching Layers, Deployment Topology, End-to-End Request Flows, Event-Driven Architecture, Failover Behavior, Frontend / Backend Interaction, Observability Architecture (+6 more)

### Community 18 - "Community 18"
Cohesion: 0.18
Nodes (10): Debugging, Deployment, Feature Rollout, Incident Response, Local Development, Migrations, Observability Investigation, Rollback (+2 more)

### Community 19 - "Community 19"
Cohesion: 0.2
Nodes (9): API Conventions, Architecture Patterns, Database / Migration Patterns, Error Handling / Logging, Naming / Structure, State Management, Testing Conventions, ticker-pm-copilot Coding Rules (+1 more)

### Community 20 - "Community 20"
Cohesion: 0.29
Nodes (6): Critical Entrypoints, First Read, How To Start Reasoning, Local Run Baseline, Module Map, ticker-pm-copilot Onboarding

### Community 21 - "Community 21"
Cohesion: 0.5
Nodes (3): Graphify-first repo discovery, Preserve repo separation, ticker-pm-copilot Decision Log

### Community 22 - "Community 22"
Cohesion: 0.5
Nodes (3): Critical Entrypoints, Read First, Top-Level Modules

### Community 32 - "Community 32"
Cohesion: 0.17
Nodes (14): AlphaVantageConfig, DailyBar, extractTickerSentiment(), NewsArticle, OptionsContract, parseCsv(), ProviderError, readExpiration() (+6 more)

### Community 33 - "Community 33"
Cohesion: 0.12
Nodes (16): Attention Now, Benefit, Category, Completion, Current Plan, Current Status, Done, Ecosystem (+8 more)

### Community 34 - "Community 34"
Cohesion: 0.19
Nodes (11): AlphaVantageOptionsProvider, average(), clamp(), classifyEarningsTiming(), estimateIvPercentile(), extractOptionsContracts(), parseDailyBars(), percentChange() (+3 more)

### Community 35 - "Community 35"
Cohesion: 0.18
Nodes (4): AlphaVantageEarningsProvider, AlphaVantageMarketProvider, AlphaVantageNewsProvider, formatProviderFailure()

### Community 36 - "Community 36"
Cohesion: 0.25
Nodes (7): Current Phase, Key Metrics, Known Issues, Next Steps, Project Status, Questions or Feedback, Recent Changes

### Community 37 - "Community 37"
Cohesion: 0.38
Nodes (5): PriceTrend, MarketProvider, MockMarketProvider, round(), seededNumber()

### Community 39 - "Community 39"
Cohesion: 0.4
Nodes (4): Code Changes, Contributing, License, Reporting Issues

### Community 40 - "Community 40"
Cohesion: 0.4
Nodes (3): config, password, username

### Community 41 - "Community 41"
Cohesion: 0.5
Nodes (3): Local, Private Vercel Deploy, Vercel

## Knowledge Gaps
- **225 isolated node(s):** `username`, `password`, `config`, `name`, `version` (+220 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AnalysisRequest` connect `Community 1` to `Community 0`, `Community 9`, `Community 6`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `AlphaVantageClient` connect `Community 38` to `Community 32`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `handleAnalysisRequest()` connect `Community 4` to `Community 0`, `Community 6`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **What connects `username`, `password`, `config` to the rest of the system?**
  _225 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._