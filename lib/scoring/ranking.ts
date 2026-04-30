import type {
  AnalysisRequest,
  HoldingReview,
  OptionsIdea,
  QueueItem,
  WatchlistSetup,
} from "@/lib/schemas/analysis";

export function buildActionQueue(input: AnalysisRequest, action: string): QueueItem[] {
  const items: QueueItem[] = [{ ticker: buildPrimaryTicker(input), action, reason: "Primary focus based on the current mode and intent." }];

  if (input.mode === "portfolio" || input.mode === "full") {
    input.positions.slice(0, 3).forEach((position, index) => {
      items.push({
        ticker: position.ticker,
        action: index === 0 ? "Review first" : "Watch closely",
        reason: `Position context includes ${position.shares} shares at average cost ${position.avgCost}.`,
      });
    });
    input.watchlist.slice(0, 2).forEach((ticker) => {
      items.push({
        ticker,
        action: "Screen for entry",
        reason: "Watchlist name that should be ranked against current holdings.",
      });
    });
  }

  if (input.mode === "full") {
    input.priorityTickers.slice(0, 2).forEach((ticker) => {
      items.push({
        ticker,
        action: "Deep-dive",
        reason: "Priority ticker requested for expanded PM-style coverage.",
      });
    });
  }

  if (input.mode === "income") {
    items.push({
      ticker: input.ticker,
      action: "Compare CC vs CSP vs PMCC",
      reason: "Income mode requires side-by-side strategy fit review.",
    });
  }

  return items.slice(0, 6);
}

export function buildHoldingReviews(positions: Array<{ ticker: string; shares: number; avgCost: number }>): HoldingReview[] {
  return positions.slice(0, 5).map((position, index) => ({
    ticker: position.ticker,
    action: index === 0 ? "Review first" : "Hold / Wait",
    conviction: index === 0 ? "Medium" : "Low",
    rationale: `${position.shares} shares at ${position.avgCost} need live price and catalyst context before ranking is final.`,
  }));
}

export function buildWatchlistSetups(watchlist: string[]): WatchlistSetup[] {
  return watchlist.slice(0, 5).map((ticker, index) => ({
    ticker,
    setup: index === 0 ? "Closest to review" : "Watch",
    rationale: "Needs live technical and catalyst context to determine entry quality.",
  }));
}

export function buildOptionsIdeas(ticker: string): OptionsIdea[] {
  return [
    {
      ticker,
      strategy: "Covered Call Candidate",
      fit: "Only valid if owned shares, acceptable capped upside, and premium justify the cap.",
      cancelIf: "Cancel if major upside catalyst or low-liquidity chain is present.",
    },
    {
      ticker,
      strategy: "Cash-Secured Put Candidate",
      fit: "Useful when you want lower entry and have assignment-ready cash.",
      cancelIf: "Cancel if you would not want assignment or support is unclear.",
    },
  ];
}

export function buildFocusLabel(input: AnalysisRequest) {
  if (input.mode === "portfolio") return "Portfolio-wide decision frame";
  if (input.mode === "full") return "Full PM review";
  return buildPrimaryTicker(input);
}

export function buildPrimaryTicker(input: AnalysisRequest) {
  if (input.mode === "ticker" || input.mode === "income") return input.ticker;
  if (input.mode === "full") return input.priorityTickers[0] || input.positions[0]?.ticker || "PORTFOLIO";
  return input.positions[0]?.ticker || "PORTFOLIO";
}
