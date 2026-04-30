import type { AnalysisDataContext } from "@/lib/data/normalize/portfolio-snapshot";
import type { AnalysisRequest, RecommendationCore, SignalSet } from "@/lib/schemas/analysis";
import type { ScoreBundle } from "@/lib/scoring/factor-scores";

export type PolicyEvaluation = {
  recommendation: RecommendationCore;
  policyFlags: string[];
  signals: SignalSet;
};

export function evaluatePolicy(
  input: AnalysisRequest,
  scoreBundle: ScoreBundle,
  context: AnalysisDataContext,
): PolicyEvaluation {
  const { factors, weightedScore } = scoreBundle;
  const policyFlags = determinePolicyFlags(input, factors, weightedScore, context);
  const action = determineAction(input, weightedScore, policyFlags);
  const confidence = weightedScore >= 74 ? "High" : weightedScore >= 58 ? "Medium" : "Low";
  const urgency = weightedScore >= 76 ? "Now" : weightedScore >= 60 ? "Soon" : weightedScore >= 45 ? "Watch" : "Avoid for now";
  const timeHorizon = input.mode === "income" ? "income" : input.mode === "ticker" ? input.timeHorizon : "Position";

  return {
    recommendation: {
      action,
      confidence,
      urgency,
      timeHorizon,
      posture: determinePosture(input, weightedScore),
      whyNow: buildWhyNow(input, weightedScore, policyFlags, context),
      invalidation: buildInvalidation(input, policyFlags, context),
    },
    policyFlags,
    signals: buildSignals(input, action, factors, policyFlags, context),
  };
}

function determinePolicyFlags(
  input: AnalysisRequest,
  factors: ScoreBundle["factors"],
  score: number,
  context: AnalysisDataContext,
) {
  const flags: string[] = [];
  const primary = context.primaryTicker;

  if (input.intent === "Should I average down?") {
    if ((input.mode === "ticker" || input.mode === "income") && !input.ownIt) {
      flags.push("Average-down blocked: no existing position.");
    }
    if (factors.catalysts <= 52) {
      flags.push("Average-down caution: catalyst quality is weak.");
    }
    if (primary?.trend === "downtrend") {
      flags.push("Average-down caution: primary trend is still down.");
    }
  }

  if (input.intent === "Is this good for covered calls?") {
    if ((input.mode === "ticker" || input.mode === "income") && !input.ownIt) {
      flags.push("Covered-call blocked: shares are not owned.");
    }
    if ((input.mode === "ticker" || input.mode === "income") && input.shares > 0 && input.shares < 100) {
      flags.push("Covered-call caution: fewer than 100 shares are modeled.");
    }
    if (primary?.earningsTiming === "upcoming") {
      flags.push("Covered-call caution: earnings are approaching.");
    }
  }

  if (input.intent === "Should I sell a CSP instead?") {
    if (input.cash <= 0) {
      flags.push("CSP blocked: no cash available.");
    }
    if (factors.optionsSuitability <= 55) {
      flags.push("CSP caution: options suitability is weak.");
    }
    if (primary?.trend === "downtrend") {
      flags.push("CSP caution: the chart is still in a downtrend.");
    }
  }

  if ((input.mode === "portfolio" || input.mode === "full") && input.positions.length > 8) {
    flags.push("Concentration caution: portfolio breadth may already be high.");
  }
  if (context.portfolio?.concentrationRisk === "high") {
    flags.push("Concentration caution: current portfolio concentration is high.");
  }

  if (score < 48) {
    flags.push("Conviction caution: weighted score is below the action threshold.");
  }

  return flags;
}

function determineAction(input: AnalysisRequest, score: number, policyFlags: string[]) {
  const blockedAverageDown = policyFlags.includes("Average-down blocked: no existing position.");
  const blockedCoveredCall = policyFlags.includes("Covered-call blocked: shares are not owned.");
  const blockedCsp = policyFlags.includes("CSP blocked: no cash available.");

  if (input.intent === "Should I buy this?") return banded(score, ["Strong Buy", "Buy", "Buy Small", "Hold / Wait"]);
  if (input.intent === "Should I add more?") return banded(score, ["Add", "Buy Small", "Hold / Wait", "Trim"]);
  if (input.intent === "Should I trim or sell?") return banded(score, ["Trim", "Sell Partial", "Sell", "Hold / Wait"]);
  if (input.intent === "Should I average down?") {
    if (blockedAverageDown) return "Avoid";
    return banded(score, ["Add", "Buy Small", "Hold / Wait", "Avoid"]);
  }
  if (input.intent === "Is this a breakout?") return banded(score, ["Buy", "Buy Small", "Hold / Wait", "Avoid"]);
  if (input.intent === "Is this good for covered calls?") {
    if (blockedCoveredCall) return "No Action";
    return banded(score, ["Covered Call Candidate", "Hold / Wait", "No Action"]);
  }
  if (blockedCsp) return "No Action";
  return banded(score, ["Cash-Secured Put Candidate", "Buy Small", "No Action"]);
}

function banded(score: number, labels: string[]) {
  if (score >= 75) return labels[0];
  if (score >= 62) return labels[1];
  if (score >= 48) return labels[Math.min(2, labels.length - 1)];
  return labels[Math.min(3, labels.length - 1)];
}

function determinePosture(input: AnalysisRequest, score: number) {
  if (input.mode === "income") return "Income-focused";
  if (score >= 74 && (input.mode === "ticker" || ("objective" in input && input.objective !== "Income"))) {
    return "Constructive";
  }
  if (input.riskStyle === "Conservative") return "Defensive";
  return "Neutral";
}

function buildWhyNow(
  input: AnalysisRequest,
  score: number,
  policyFlags: string[],
  context: AnalysisDataContext,
) {
  if (policyFlags.length > 0) {
    return `Policy engine found ${policyFlags.length} gating or caution condition(s), so the recommendation is conservative around a score of ${score}/100.`;
  }

  if (context.primaryTicker?.trend === "uptrend" && context.primaryTicker.sentimentScore >= 65) {
    return `Trend and sentiment are aligned in the current snapshot, which supports a stronger ${score}/100 read.`;
  }

  if (input.intent === "Is this a breakout?") {
    return `Technical weighting leads this decision, and the current structure score is ${score}/100.`;
  }

  return `The recommendation is driven by deterministic scoring and passes the current hard-gate set with a ${score}/100 score.`;
}

function buildInvalidation(
  input: AnalysisRequest,
  policyFlags: string[],
  context: AnalysisDataContext,
) {
  const firstFlag = policyFlags[0];
  if (firstFlag) {
    return `${firstFlag} Live price, earnings, news, or options data may invalidate the current view.`;
  }

  if (context.primaryTicker?.earningsTiming === "upcoming") {
    return "Upcoming earnings are the clearest invalidation point for the current view.";
  }

  if (input.intent === "Should I trim or sell?") {
    return "A stronger thesis, improved technical structure, or cleaner catalyst setup would weaken the trim/sell case.";
  }

  return "Live price, earnings, news, or options data may materially change this view.";
}

function buildSignals(
  input: AnalysisRequest,
  action: string,
  factors: ScoreBundle["factors"],
  policyFlags: string[],
  context: AnalysisDataContext,
): SignalSet {
  const positives: string[] = [];
  const risks: string[] = [];

  if (factors.thesis >= 65) positives.push("Base thesis quality is acceptable for a first-pass decision.");
  if (factors.technicals >= 70) positives.push("Technical weighting supports a more constructive setup read.");
  if (factors.optionsSuitability >= 70) positives.push("Options suitability is strong enough for an income overlay review.");
  if (input.mode === "portfolio" || input.mode === "full") positives.push("Portfolio context is present, so ranking logic can compare multiple names.");

  if ((input.mode === "ticker" || input.mode === "income") && input.avgCost > 0) {
    risks.push("Cost basis is known, so add or trim decisions should be benchmarked against it.");
  }
  if (context.primaryTicker?.earningsTiming === "upcoming") {
    risks.push("An upcoming earnings event may increase gap risk.");
  }
  if (input.cash <= 0 && input.intent === "Should I sell a CSP instead?") {
    risks.push("CSP logic is blocked without cash available.");
  }
  if (action === "Avoid" || action === "No Action") {
    risks.push("At least one hard gate failed, so patience is the correct default.");
  }

  policyFlags.forEach((flag) => risks.push(flag));

  return { positives, risks };
}
