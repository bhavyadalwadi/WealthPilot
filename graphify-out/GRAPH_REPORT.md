# Graph Report - ticker-pm-copilot  (2026-05-19)

## Corpus Check
- 56 files · ~14,673 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 384 nodes · 759 edges · 15 communities (13 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

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

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `generateMockAnalysis()` - 14 edges
3. `validateRequest()` - 13 edges
4. `handleAnalysisRequest()` - 13 edges
5. `Northstar PM Copilot Build Plan` - 13 edges
6. `AnalysisMode` - 10 edges
7. `AnalysisResponse` - 10 edges
8. `DecisionIntent` - 9 edges
9. `AnalysisRequest` - 9 edges
10. `buildScoreBundle()` - 9 edges

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

## Communities (15 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (40): ACTION_LABELS, ActionLabel, ActionQueue(), ActionQueueProps, DecisionCard(), PromptCard(), ResultsBoardProps, SignalCard() (+32 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (30): AlphaVantageClient, AlphaVantageConfig, AlphaVantageEarningsProvider, AlphaVantageMarketProvider, AlphaVantageNewsProvider, AlphaVantageOptionsProvider, average(), clamp() (+22 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (30): LLM_FIELD_CONFIG, LLM_PROVIDER_OPTIONS, LLM_REASONING_OPTIONS, FIELD_CONFIG, INTENT_OPTIONS, MODE_CONFIG, ModeDefinition, defaults (+22 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (28): CacheEntry, MemoryCache, buildAnalysisDataContext(), buildPortfolioSnapshot(), getDefaultProviders(), mockProviders, ProviderBundle, round() (+20 more)

### Community 4 - "Community 4"
Cohesion: 0.1
Nodes (30): POST(), appendAnalysisHistory(), deleteSavedPortfolio(), getSavedPortfolio(), getUserProfile(), listAnalysisHistory(), listSavedPortfolios(), saveUserProfile() (+22 more)

### Community 5 - "Community 5"
Cohesion: 0.05
Nodes (36): `AnalysisRequest`, API Routes And JSON Contracts, Build Order, code:text (ticker-pm-copilot/), code:ts (type Recommendation = {), code:json ({), code:json ({), code:json ({) (+28 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (30): generateMemo(), FactorScores, FullReviewResponse, HoldingReview, IncomeAnalysisResponse, OptionsIdea, PortfolioAnalysisResponse, QueueItem (+22 more)

### Community 7 - "Community 7"
Cohesion: 0.1
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (18): dependencies, next, react, react-dom, devDependencies, @types/node, @types/react, @types/react-dom (+10 more)

### Community 9 - "Community 9"
Cohesion: 0.25
Nodes (9): buildMemoSystemPrompt(), buildMemoUserPrompt(), MemoInput, MemoProvider, MemoResult, MockMemoProvider, CompatibleConfig, OpenAICompatibleMemoProvider (+1 more)

### Community 10 - "Community 10"
Cohesion: 0.24
Nodes (12): RecommendationCore, SignalSet, ScoreBundle, banded(), buildInvalidation(), buildSignals(), buildWhyNow(), determineAction() (+4 more)

### Community 11 - "Community 11"
Cohesion: 0.25
Nodes (7): Environment, Key folders, Next build step, Persistence, Run, WealthPilot, What this build does

## Knowledge Gaps
- **97 isolated node(s):** `name`, `version`, `private`, `dev`, `build` (+92 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AnalysisRequest` connect `Community 0` to `Community 9`, `Community 10`, `Community 3`, `Community 6`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `handleAnalysisRequest()` connect `Community 4` to `Community 0`, `Community 6`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _97 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._