# ticker-pm-copilot Graph Relationships

       ## Service Dependency Graph
       ticker-pm-copilot
-> Next.js selector-first analysis UI
-> provider-backed market/news/earnings/options data layer
-> memo generation layer using OpenAI-compatible APIs
-> API: typed analysis route handlers under `app`
-> API: OpenAI-compatible memo provider calls
-> API: Alpha Vantage HTTP calls via provider adapters
-> Async: parallel provider fetches per ticker
-> Async: memo generation after deterministic analysis payload construction
-> Deployment: Next.js app with environment-selected provider strategy and optional live Alpha Vantage use.

       ## Runtime Dependency Graph
       ticker-pm-copilot
-> Runtime: Next.js
-> Runtime: React
-> Runtime: TypeScript
-> Runtime: OpenAI-compatible APIs
-> Runtime: Alpha Vantage

       ## Database Relationship Graph
       ticker-pm-copilot
-> no dedicated database visible

       ## API Consumer / Provider Graph
       ticker-pm-copilot
-> typed analysis route handlers under `app`
-> OpenAI-compatible memo provider calls
-> Alpha Vantage HTTP calls via provider adapters

       ## Queue Publisher / Consumer Graph
       ticker-pm-copilot
-> parallel provider fetches per ticker
-> memo generation after deterministic analysis payload construction

       ## Shared Package Dependency Graph
       ticker-pm-copilot
-> no notable shared package layer beyond app-local dependencies

       ## Deployment Relationship Graph
       ticker-pm-copilot
       - Next.js app with environment-selected provider strategy and optional live Alpha Vantage use.

       ## Cross-Repo Relationship Graph
       ticker-pm-copilot
-> no runtime dependency on sibling repos by default
