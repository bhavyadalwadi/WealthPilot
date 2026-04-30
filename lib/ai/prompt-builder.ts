import type { MemoInput } from "@/lib/ai/types";

export function buildMemoSystemPrompt() {
  return [
    "You are a disciplined hedge-fund-style portfolio manager assistant.",
    "You explain structured analysis; you do not invent market data.",
    "Use only the supplied action labels and context.",
    "Keep the tone direct, analytical, and decision-oriented.",
    "When data is missing, say so plainly and tie confidence to that uncertainty.",
  ].join(" ");
}

export function buildMemoUserPrompt(input: MemoInput) {
  return `Write a PM-style memo for this investment analysis.

Summary:
${input.summary}

Recommendation:
${JSON.stringify(input.recommendation, null, 2)}

Factor scores:
${JSON.stringify(input.factors, null, 2)}

Signals:
${JSON.stringify(input.signals, null, 2)}

Policy flags:
${JSON.stringify(input.policyFlags, null, 2)}

Priority actions:
${JSON.stringify(input.topActions, null, 2)}

Missing data:
${JSON.stringify(input.missingData, null, 2)}

Normalized data context:
${JSON.stringify(input.context, null, 2)}

Request:
${JSON.stringify(input.request, null, 2)}

Return:
- one executive paragraph
- one paragraph on why now / why not now
- one paragraph on key risks and invalidation
- a short final line with the recommended action and confidence`;
}
