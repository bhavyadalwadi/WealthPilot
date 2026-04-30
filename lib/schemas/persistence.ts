import type {
  Confidence,
  DecisionIntent,
  LlmProvider,
  Objective,
  PortfolioPosition,
  ReasoningEffort,
  RiskStyle,
  TimeHorizon,
} from "@/lib/schemas/analysis";

export type UserProfile = {
  id: "default";
  defaultRiskStyle: RiskStyle;
  defaultObjective: Objective;
  defaultTimeHorizon: Exclude<TimeHorizon, "income">;
  defaultLlmProvider: LlmProvider;
  defaultLlmModel: string;
  defaultLlmReasoning: ReasoningEffort;
  updatedAt: string;
};

export type SavedPortfolio = {
  id: string;
  name: string;
  positions: PortfolioPosition[];
  watchlist: string[];
  cash: number;
  objective: Objective;
  riskStyle: RiskStyle;
  notes: string;
  updatedAt: string;
};

export type AnalysisHistoryEntry = {
  id: string;
  createdAt: string;
  mode: "ticker" | "portfolio" | "income" | "full";
  intent: DecisionIntent;
  focusLabel: string;
  action: string;
  confidence: Confidence;
  summary: string;
  llmProvider: LlmProvider;
  llmModel: string;
};
