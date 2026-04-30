import type {
  AnalysisRequest,
  AnalysisResponse,
  FactorScores,
  FullReviewResponse,
  IncomeAnalysisResponse,
  PortfolioAnalysisResponse,
  TickerAnalysisResponse,
  TickerSection,
} from "@/lib/schemas/analysis";
import { generateMemo } from "@/lib/ai/memo-generator";
import { buildAnalysisDataContext } from "@/lib/data/service";
import { buildScoreBundle } from "@/lib/scoring/factor-scores";
import { evaluatePolicy } from "@/lib/scoring/policy-engine";
import {
  buildActionQueue,
  buildFocusLabel,
  buildHoldingReviews,
  buildOptionsIdeas,
  buildPrimaryTicker,
  buildWatchlistSetups,
} from "@/lib/scoring/ranking";

export async function generateMockAnalysis(input: AnalysisRequest): Promise<AnalysisResponse> {
  const context = await buildAnalysisDataContext(input);
  const scoreBundle = buildScoreBundle(input, context);
  const policy = evaluatePolicy(input, scoreBundle, context);
  const topActions = buildActionQueue(input, policy.recommendation.action);
  const prompt = buildPrompt(
    input,
    policy.recommendation.action,
    scoreBundle.factors,
    policy.policyFlags,
    context,
  );
  const missingData = [
    "Market, earnings, news, and options data are flowing through mock provider adapters.",
    "Provider outputs are normalized now, but still not sourced from live APIs.",
    ...context.missingData,
  ];
  const memo = await generateMemo({
    request: input,
    context,
    summary: buildSummary(
      input,
      policy.recommendation.action,
      policy.recommendation.confidence,
      policy.recommendation.urgency,
      scoreBundle.weightedScore,
    ),
    recommendation: policy.recommendation,
    factors: scoreBundle.factors,
    signals: policy.signals,
    topActions,
    missingData,
    policyFlags: policy.policyFlags,
  });
  const summary = buildSummary(
    input,
    policy.recommendation.action,
    policy.recommendation.confidence,
    policy.recommendation.urgency,
    scoreBundle.weightedScore,
  );

  const base = {
    mode: input.mode,
    intent: input.intent,
    focusLabel: buildFocusLabel(input),
    score: scoreBundle.weightedScore,
    summary,
    recommendation: policy.recommendation,
    factors: scoreBundle.factors,
    signals: policy.signals,
    topActions,
    prompt,
    missingData,
    memo: memo.content,
    llm: {
      provider: memo.provider,
      model: memo.model,
      reasoning: memo.reasoning,
      source: memo.source,
    },
  };

  if (input.mode === "ticker") {
    const response: TickerAnalysisResponse = {
        ...base,
        mode: "ticker",
      ticker: buildTickerSection(
        context.primaryTicker?.ticker || input.ticker,
        input.notes,
        policy.recommendation.action,
        context,
      ),
    };
    return response;
  }

  if (input.mode === "portfolio") {
    const response: PortfolioAnalysisResponse = {
      ...base,
      mode: "portfolio",
      portfolio: {
        overallPosture: policy.recommendation.posture,
        holdings: buildHoldingReviews(input.positions),
        watchlist: buildWatchlistSetups(input.watchlist),
        capitalDeploymentPlan: [
          "Fund highest-conviction adds only after checking concentration.",
          "Prefer watchlist entries via starter size or patience over forced adds.",
          "Keep dry powder for earnings and event-driven dislocations.",
        ],
        riskFlags: [
          "Portfolio overlap is not yet computed from sector metadata.",
          "Concentration limits are inferred, not sourced from saved user policy.",
        ],
      },
    };
    return response;
  }

  if (input.mode === "income") {
    const response: IncomeAnalysisResponse = {
      ...base,
      mode: "income",
      income: {
        ticker: input.ticker,
        bestStrategy: policy.recommendation.action,
        alternatives: ["Hold / Wait", "Cash-Secured Put Candidate", "Poor Man's Covered Call Candidate"],
        cancellationConditions: [
          "Imminent earnings or major catalyst raises upside-cap risk.",
          "Weak liquidity or thin premium makes income selling unattractive.",
        ],
        optionsIdeas: buildOptionsIdeas(input.ticker),
      },
    };
    return response;
  }

  const response: FullReviewResponse = {
    ...base,
    mode: "full",
    review: {
      executiveView: [
        "Use this as the top-down PM briefing across holdings, watchlist, and income overlays.",
        "Prioritize capital allocation before adding new names.",
        "Treat options overlays as secondary to thesis and technical health.",
      ],
      holdings: buildHoldingReviews(input.positions),
      watchlist: buildWatchlistSetups(input.watchlist),
      optionsIdeas: buildOptionsIdeas(input.priorityTickers[0] || input.positions[0]?.ticker || "TICKER"),
      capitalDeploymentPlan: [
        "Rank current holdings before allocating fresh cash to watchlist names.",
        "Use priority tickers for deeper review, not automatic deployment.",
        "Require thesis confirmation before averaging down any underwater name.",
      ],
    },
  };
  return response;
}

function buildPrompt(
  input: AnalysisRequest,
  action: string,
  factors: FactorScores,
  policyFlags: string[],
  context: Awaited<ReturnType<typeof buildAnalysisDataContext>>,
) {
  return `You are my hedge-fund-style portfolio copilot.

Mode: ${input.mode}
Intent: ${input.intent}
Current provisional action: ${action}

Normalized request:
${JSON.stringify(input, null, 2)}

Internal factor scores:
${JSON.stringify(factors, null, 2)}

Policy flags:
${JSON.stringify(policyFlags, null, 2)}

Normalized data context:
${JSON.stringify(context, null, 2)}

Required behavior:
- Fetch and analyze company, technical, earnings, sentiment, news, and options context as needed.
- Do not ask me for support, resistance, catalysts, or sentiment manually unless critical data is missing.
- Make a PM-style recommendation using only approved action labels.
- Include confidence, urgency, why now, invalidation, and next move.
- Distinguish between a good company and a good setup.
- Default to patience when hard gates fail.

Deliver the response in a structured investment memo with an executive view, priority actions, detailed rationale, and a final PM summary.`;
}

function buildSummary(
  input: AnalysisRequest,
  action: string,
  confidence: "High" | "Medium" | "Low",
  urgency: "Now" | "Soon" | "Watch" | "Avoid for now",
  score: number,
) {
  const scope =
    input.mode === "portfolio" || input.mode === "full"
      ? "This response is organized around capital allocation and ranking."
      : "This response is organized around one decision on one name.";

  return `${action} with ${confidence.toLowerCase()} conviction and ${urgency.toLowerCase()} urgency. ${scope} The deterministic score is ${score}/100 and now runs on normalized market/news/earnings/options snapshots so live providers can plug in cleanly.`;
}

function buildTickerSection(
  ticker: string,
  notes: string,
  action: string,
  context: Awaited<ReturnType<typeof buildAnalysisDataContext>>,
): TickerSection {
  const snapshot = context.primaryTicker;
  return {
    ticker,
    thesis: notes || `${snapshot?.companyName || ticker} still needs live company and narrative context before this can become a real PM read.`,
    technicalState: `${action} is currently based on a ${snapshot?.trend || "mock"} trend state with normalized snapshot inputs.`,
    support: snapshot?.supportLevels.map(String) || ["Pending provider data"],
    resistance: snapshot?.resistanceLevels.map(String) || ["Pending provider data"],
    breakoutLevel: String(snapshot?.breakoutLevel ?? "Pending provider data"),
    breakdownRisk: String(snapshot?.breakdownLevel ?? "Pending provider data"),
    catalysts: snapshot?.catalystSummary.length ? snapshot.catalystSummary : ["Catalyst provider returned no notable event."],
    sentiment: snapshot
      ? `${snapshot.sentiment} sentiment with ${snapshot.unusualOptionsFlow} options flow and IV regime ${snapshot.ivRegime}.`
      : "Sentiment snapshot unavailable.",
  };
}
