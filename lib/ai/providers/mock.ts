import type { MemoInput, MemoProvider, MemoResult } from "@/lib/ai/types";

export class MockMemoProvider implements MemoProvider {
  async generateMemo(input: MemoInput): Promise<MemoResult> {
    const { recommendation, request, factors, signals, missingData } = input;

    const content = [
      `${request.intent} currently maps to ${recommendation.action} with ${recommendation.confidence.toLowerCase()} conviction. ${input.summary}`,
      `The score mix is thesis ${factors.thesis}, technicals ${factors.technicals}, catalysts ${factors.catalysts}, portfolio fit ${factors.portfolioFit}, and options suitability ${factors.optionsSuitability}. ${recommendation.whyNow}`,
      `Key risks: ${signals.risks.join(" ") || "No major policy risks were triggered."} Invalidation: ${recommendation.invalidation}`,
      `Missing data: ${missingData.join(" ") || "No missing-data flags were raised."}`,
      `Final PM call: ${recommendation.action} (${recommendation.confidence}).`,
    ].join("\n\n");

    return {
      content,
      provider: request.llmProvider,
      model: request.llmModel,
      reasoning: request.llmReasoning,
      source: "mock",
    };
  }
}
