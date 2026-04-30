import { handleAnalysisRequest } from "@/lib/server/respond";

export async function POST(request: Request) {
  return handleAnalysisRequest(request, "portfolio");
}
