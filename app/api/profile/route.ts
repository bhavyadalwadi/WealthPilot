import { NextResponse } from "next/server";
import { saveUserProfile, getUserProfile } from "@/db/queries";
import { DEFAULT_LLM_MODEL, DEFAULT_LLM_PROVIDER, DEFAULT_LLM_REASONING } from "@/lib/config/llm";
import type { Objective, ReasoningEffort, RiskStyle, TimeHorizon, LlmProvider } from "@/lib/schemas/analysis";

export async function GET() {
  return NextResponse.json(await getUserProfile());
}

export async function PUT(request: Request) {
  const body = (await request.json()) as Partial<{
    defaultRiskStyle: RiskStyle;
    defaultObjective: Objective;
    defaultTimeHorizon: Exclude<TimeHorizon, "income">;
    defaultLlmProvider: LlmProvider;
    defaultLlmModel: string;
    defaultLlmReasoning: ReasoningEffort;
  }>;

  const profile = await saveUserProfile({
    defaultRiskStyle: body.defaultRiskStyle || "Balanced",
    defaultObjective: body.defaultObjective || "Balanced",
    defaultTimeHorizon: body.defaultTimeHorizon || "Position",
    defaultLlmProvider: body.defaultLlmProvider || DEFAULT_LLM_PROVIDER,
    defaultLlmModel: body.defaultLlmModel || DEFAULT_LLM_MODEL,
    defaultLlmReasoning: body.defaultLlmReasoning || DEFAULT_LLM_REASONING,
  });

  return NextResponse.json(profile);
}
