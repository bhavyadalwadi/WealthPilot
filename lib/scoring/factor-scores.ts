import type { AnalysisDataContext } from "@/lib/data/normalize/portfolio-snapshot";
import type { TickerSnapshot } from "@/lib/data/normalize/ticker-snapshot";
import type { AnalysisRequest, DecisionIntent, FactorScores } from "@/lib/schemas/analysis";

export const intentWeights: Record<DecisionIntent, Record<keyof FactorScores, number>> = {
  "Should I buy this?": {
    thesis: 30,
    technicals: 30,
    catalysts: 15,
    portfolioFit: 15,
    optionsSuitability: 10,
  },
  "Should I add more?": {
    thesis: 20,
    technicals: 25,
    catalysts: 10,
    portfolioFit: 30,
    optionsSuitability: 15,
  },
  "Should I trim or sell?": {
    thesis: 20,
    technicals: 25,
    catalysts: 20,
    portfolioFit: 25,
    optionsSuitability: 10,
  },
  "Should I average down?": {
    thesis: 35,
    technicals: 25,
    catalysts: 20,
    portfolioFit: 20,
    optionsSuitability: 0,
  },
  "Is this a breakout?": {
    thesis: 10,
    technicals: 50,
    catalysts: 20,
    portfolioFit: 10,
    optionsSuitability: 10,
  },
  "Is this good for covered calls?": {
    thesis: 10,
    technicals: 20,
    catalysts: 20,
    portfolioFit: 15,
    optionsSuitability: 35,
  },
  "Should I sell a CSP instead?": {
    thesis: 15,
    technicals: 20,
    catalysts: 15,
    portfolioFit: 20,
    optionsSuitability: 30,
  },
};

export type ScoreBundle = {
  factors: FactorScores;
  weightedScore: number;
};

export function buildScoreBundle(input: AnalysisRequest, context: AnalysisDataContext): ScoreBundle {
  const factors: FactorScores = {
    thesis: baseScoreFromRisk(input.riskStyle),
    technicals: inferTechnicalScore(input.intent, input.notes, context.primaryTicker),
    catalysts: inferCatalystScore(input.intent, input.notes, context.primaryTicker),
    portfolioFit: inferPortfolioFit(input, context),
    optionsSuitability: inferOptionsSuitability(input, context.primaryTicker, context),
  };

  return {
    factors,
    weightedScore: scoreWeighted(input.intent, factors),
  };
}

function baseScoreFromRisk(riskStyle: AnalysisRequest["riskStyle"]) {
  if (riskStyle === "Aggressive") return 70;
  if (riskStyle === "Conservative") return 58;
  return 64;
}

function inferTechnicalScore(intent: DecisionIntent, notes: string, snapshot: TickerSnapshot | null) {
  const text = notes.toLowerCase();
  let score = 60;
  if (intent === "Is this a breakout?") score += 12;
  if (text.includes("breakout") || text.includes("momentum")) score += 10;
  if (text.includes("weak") || text.includes("falling")) score -= 12;
  if (text.includes("support") || text.includes("resistance")) score += 4;
  if (snapshot?.trend === "uptrend") score += 10;
  if (snapshot?.trend === "downtrend") score -= 10;
  if ((snapshot?.momentumScore ?? 0) >= 70) score += 6;
  if ((snapshot?.momentumScore ?? 0) <= 42) score -= 6;
  return clamp(score, 35, 88);
}

function inferCatalystScore(intent: DecisionIntent, notes: string, snapshot: TickerSnapshot | null) {
  const text = notes.toLowerCase();
  let score = 58;
  if (intent === "Should I trim or sell?") score += 4;
  if (intent === "Should I average down?") score -= 3;
  if (text.includes("earnings")) score -= 6;
  if (text.includes("guidance") || text.includes("news")) score -= 4;
  if (text.includes("beat") || text.includes("strong demand")) score += 8;
  if (snapshot?.earningsTiming === "upcoming") score -= 8;
  if (snapshot?.earningsTiming === "recent") score -= 2;
  score += Math.round(((snapshot?.sentimentScore ?? 55) - 55) / 6);
  return clamp(score, 30, 84);
}

function inferPortfolioFit(input: AnalysisRequest, context: AnalysisDataContext) {
  let score = 60;
  if (input.mode === "portfolio" || input.mode === "full") score += input.positions.length ? 8 : -4;
  if ((input.mode === "portfolio" || input.mode === "full") && input.positions.length > 8) score -= 8;
  if ((input.mode === "ticker" || input.mode === "income") && input.shares >= 100) score += 4;
  if (input.cash > 10000) score += 6;
  if ((input.mode === "portfolio" || input.mode === "full") && input.objective === "Income") score += 6;
  if ((input.mode === "portfolio" || input.mode === "full") && input.objective === "Growth") score -= 2;
  if (context.portfolio?.concentrationRisk === "high") score -= 8;
  if (context.portfolio?.concentrationRisk === "moderate") score -= 3;
  return clamp(score, 35, 86);
}

function inferOptionsSuitability(
  input: AnalysisRequest,
  snapshot: TickerSnapshot | null,
  context: AnalysisDataContext,
) {
  let score = 45;
  if (input.intent === "Is this good for covered calls?") score += 26;
  if (input.intent === "Should I sell a CSP instead?") score += 24;
  if ((input.mode === "ticker" || input.mode === "income") && input.ownIt && input.shares >= 100) score += 16;
  if (input.cash >= 1000) score += 10;
  if (input.mode === "income" && input.incomeGoal) score += 8;
  if ((input.mode === "portfolio" || input.mode === "full") && input.objective === "Income") score += 8;
  if (snapshot?.ivRegime === "elevated") score += 10;
  if (snapshot?.optionsLiquidityScore) score += Math.round((snapshot.optionsLiquidityScore - 50) / 8);
  if (snapshot?.unusualOptionsFlow === "bearish" && input.intent === "Is this good for covered calls?") score += 4;
  if (snapshot?.unusualOptionsFlow === "bullish" && input.intent === "Should I sell a CSP instead?") score += 4;
  if (context.portfolio?.cashAvailable === 0 && input.intent === "Should I sell a CSP instead?") score -= 20;
  return clamp(score, 25, 92);
}

function scoreWeighted(intent: DecisionIntent, factors: FactorScores) {
  const weights = intentWeights[intent];
  const total =
    factors.thesis * weights.thesis +
    factors.technicals * weights.technicals +
    factors.catalysts * weights.catalysts +
    factors.portfolioFit * weights.portfolioFit +
    factors.optionsSuitability * weights.optionsSuitability;

  return Math.round(total / 100);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
