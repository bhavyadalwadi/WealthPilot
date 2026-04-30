import type { AnalysisDataContext } from "@/lib/data/normalize/portfolio-snapshot";
import type { AnalysisRequest, Confidence, FactorScores, LlmProvider, QueueItem, ReasoningEffort, RecommendationCore, SignalSet } from "@/lib/schemas/analysis";

export type MemoInput = {
  request: AnalysisRequest;
  context: AnalysisDataContext;
  summary: string;
  recommendation: RecommendationCore;
  factors: FactorScores;
  signals: SignalSet;
  topActions: QueueItem[];
  missingData: string[];
  policyFlags: string[];
};

export type MemoResult = {
  content: string;
  provider: LlmProvider;
  model: string;
  reasoning: ReasoningEffort;
  source: "mock" | "llm";
};

export type MemoProvider = {
  generateMemo(input: MemoInput): Promise<MemoResult>;
};
