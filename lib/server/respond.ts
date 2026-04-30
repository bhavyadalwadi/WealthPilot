import { NextResponse } from "next/server";
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
  return NextResponse.json(response);
}
