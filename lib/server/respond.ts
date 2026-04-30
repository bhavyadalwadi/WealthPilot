import { NextResponse } from "next/server";
import { appendAnalysisHistory, upsertSavedPortfolio } from "@/db/queries";
import type { AnalysisMode, AnalysisResponse } from "@/lib/schemas/analysis";
import { generateMockAnalysis } from "@/lib/scoring/mock-engine";
import { validateRequest } from "@/lib/server/validation";

export async function handleAnalysisRequest(request: Request, mode: AnalysisMode) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_REQUEST",
          message: "Request body must be valid JSON.",
          details: ["Failed to parse JSON body."],
        },
      },
      { status: 400 },
    );
  }

  const validated = validateRequest(mode, payload);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const response: AnalysisResponse = await generateMockAnalysis(validated.data);

  await appendAnalysisHistory({
    mode: response.mode,
    intent: response.intent,
    focusLabel: response.focusLabel,
    action: response.recommendation.action,
    confidence: response.recommendation.confidence,
    summary: response.summary,
    llmProvider: response.llm.provider,
    llmModel: response.llm.model,
  });

  if (
    typeof payload === "object" &&
    payload !== null &&
    "portfolioName" in payload &&
    typeof payload.portfolioName === "string" &&
    payload.portfolioName.trim() &&
    (validated.data.mode === "portfolio" || validated.data.mode === "full")
  ) {
    await upsertSavedPortfolio({
      name: payload.portfolioName.trim(),
      positions: validated.data.positions,
      watchlist: validated.data.watchlist,
      cash: validated.data.cash,
      objective: validated.data.objective,
      riskStyle: validated.data.riskStyle,
      notes: validated.data.notes,
    });
  }

  return NextResponse.json(response);
}
