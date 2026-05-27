# ticker-pm-copilot Decision Log

## Graphify-first repo discovery
- Decision: Graphify-first repo discovery
- Why: Many repos already keep `graphify-out/` committed, which is a deliberate low-token navigation layer.
- Tradeoffs: Fast onboarding and lower context cost
- Operational implications: Semantic packs can become stale if not refreshed.

## Preserve repo separation
- Decision: Preserve repo separation
- Why: The workspace favors many focused repos instead of one monorepo.
- Tradeoffs: Lower blast radius and clearer product boundaries
- Operational implications: Cross-repo reuse stays lightweight and mostly conceptual.
