import type { ActionLabel } from "@/lib/config/action-labels";

export type AnalysisMode = "ticker" | "portfolio" | "income" | "full";

export type DecisionIntent =
  | "Should I buy this?"
  | "Should I add more?"
  | "Should I trim or sell?"
  | "Should I average down?"
  | "Is this a breakout?"
  | "Is this good for covered calls?"
  | "Should I sell a CSP instead?";

export type RiskStyle = "Conservative" | "Balanced" | "Aggressive";
export type TimeHorizon = "Swing" | "Position" | "Long-term" | "income";
export type Objective = "Balanced" | "Growth" | "Income";
export type OwnershipState = "No" | "Yes";
export type Confidence = "High" | "Medium" | "Low";
export type Urgency = "Now" | "Soon" | "Watch" | "Avoid for now";
export type LlmProvider = "mock" | "openai" | "openai-compatible";
export type ReasoningEffort = "minimal" | "low" | "medium" | "high";

export type FormFieldConfig = {
  name: keyof FormPayload;
  label: string;
  type: "text" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
};

export type PortfolioPosition = {
  ticker: string;
  shares: number;
  avgCost: number;
};

export type FormPayload = {
  intent?: string;
  ticker?: string;
  ownIt?: OwnershipState;
  shares?: string;
  avgCost?: string;
  riskStyle?: RiskStyle;
  timeHorizon?: TimeHorizon;
  cash?: string;
  notes?: string;
  positions?: string;
  watchlist?: string;
  objective?: Objective;
  constraints?: string;
  incomeGoal?: string;
  priorityTickers?: string;
  llmProvider?: LlmProvider;
  llmModel?: string;
  llmReasoning?: ReasoningEffort;
};

export type BaseAnalysisRequest = {
  mode: AnalysisMode;
  intent: DecisionIntent;
  riskStyle: RiskStyle;
  cash: number;
  notes: string;
  llmProvider: LlmProvider;
  llmModel: string;
  llmReasoning: ReasoningEffort;
};

export type TickerRequest = BaseAnalysisRequest & {
  mode: "ticker";
  ticker: string;
  ownIt: boolean;
  shares: number;
  avgCost: number;
  timeHorizon: Exclude<TimeHorizon, "income">;
};

export type PortfolioRequest = BaseAnalysisRequest & {
  mode: "portfolio";
  positions: PortfolioPosition[];
  watchlist: string[];
  objective: Objective;
  constraints: string;
};

export type IncomeRequest = BaseAnalysisRequest & {
  mode: "income";
  ticker: string;
  ownIt: boolean;
  shares: number;
  avgCost: number;
  incomeGoal: string;
};

export type FullReviewRequest = BaseAnalysisRequest & {
  mode: "full";
  positions: PortfolioPosition[];
  watchlist: string[];
  priorityTickers: string[];
  objective: Objective;
};

export type AnalysisRequest = TickerRequest | PortfolioRequest | IncomeRequest | FullReviewRequest;

export type FactorScores = {
  thesis: number;
  technicals: number;
  catalysts: number;
  portfolioFit: number;
  optionsSuitability: number;
};

export type SignalSet = {
  positives: string[];
  risks: string[];
};

export type QueueItem = {
  ticker: string;
  action: string;
  reason: string;
};

export type RecommendationCore = {
  action: ActionLabel | string;
  confidence: Confidence;
  urgency: Urgency;
  timeHorizon: TimeHorizon;
  posture: string;
  whyNow: string;
  invalidation: string;
};

export type TickerSection = {
  ticker: string;
  thesis: string;
  technicalState: string;
  support: string[];
  resistance: string[];
  breakoutLevel: string;
  breakdownRisk: string;
  catalysts: string[];
  sentiment: string;
};

export type HoldingReview = {
  ticker: string;
  action: string;
  conviction: Confidence;
  rationale: string;
};

export type WatchlistSetup = {
  ticker: string;
  setup: string;
  rationale: string;
};

export type OptionsIdea = {
  ticker: string;
  strategy: string;
  fit: string;
  cancelIf: string;
};

export type BaseAnalysisResponse = {
  mode: AnalysisMode;
  intent: DecisionIntent;
  focusLabel: string;
  score: number;
  summary: string;
  recommendation: RecommendationCore;
  factors: FactorScores;
  signals: SignalSet;
  topActions: QueueItem[];
  prompt: string;
  missingData: string[];
  memo: string;
  llm: {
    provider: LlmProvider;
    model: string;
    reasoning: ReasoningEffort;
    source: "mock" | "llm";
  };
};

export type TickerAnalysisResponse = BaseAnalysisResponse & {
  mode: "ticker";
  ticker: TickerSection;
};

export type PortfolioAnalysisResponse = BaseAnalysisResponse & {
  mode: "portfolio";
  portfolio: {
    overallPosture: string;
    holdings: HoldingReview[];
    watchlist: WatchlistSetup[];
    capitalDeploymentPlan: string[];
    riskFlags: string[];
  };
};

export type IncomeAnalysisResponse = BaseAnalysisResponse & {
  mode: "income";
  income: {
    ticker: string;
    bestStrategy: string;
    alternatives: string[];
    cancellationConditions: string[];
    optionsIdeas: OptionsIdea[];
  };
};

export type FullReviewResponse = BaseAnalysisResponse & {
  mode: "full";
  review: {
    executiveView: string[];
    holdings: HoldingReview[];
    watchlist: WatchlistSetup[];
    optionsIdeas: OptionsIdea[];
    capitalDeploymentPlan: string[];
  };
};

export type AnalysisResponse =
  | TickerAnalysisResponse
  | PortfolioAnalysisResponse
  | IncomeAnalysisResponse
  | FullReviewResponse;

export type ValidationErrorResponse = {
  error: {
    code: "INVALID_REQUEST";
    message: string;
    details: string[];
  };
};
