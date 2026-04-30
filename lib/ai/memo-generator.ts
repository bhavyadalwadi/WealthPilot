import { DEFAULT_LLM_MODEL, DEFAULT_LLM_PROVIDER, DEFAULT_LLM_REASONING } from "@/lib/config/llm";
import { MockMemoProvider } from "@/lib/ai/providers/mock";
import { OpenAICompatibleMemoProvider } from "@/lib/ai/providers/openai-compatible";
import type { MemoInput, MemoResult } from "@/lib/ai/types";

export async function generateMemo(input: MemoInput): Promise<MemoResult> {
  const provider = input.request.llmProvider || DEFAULT_LLM_PROVIDER;
  const model = input.request.llmModel || DEFAULT_LLM_MODEL;
  const reasoning = input.request.llmReasoning || DEFAULT_LLM_REASONING;

  input.request.llmProvider = provider;
  input.request.llmModel = model;
  input.request.llmReasoning = reasoning;

  const openAiKey = process.env.OPENAI_API_KEY;
  const compatibleKey = process.env.LLM_API_KEY;
  const compatibleBaseUrl = process.env.LLM_BASE_URL;

  try {
    if (provider === "openai" && openAiKey) {
      return await new OpenAICompatibleMemoProvider({
        provider,
        apiKey: openAiKey,
        baseUrl: "https://api.openai.com/v1",
      }).generateMemo(input);
    }

    if (provider === "openai-compatible" && compatibleKey && compatibleBaseUrl) {
      return await new OpenAICompatibleMemoProvider({
        provider,
        apiKey: compatibleKey,
        baseUrl: compatibleBaseUrl.replace(/\/$/, ""),
      }).generateMemo(input);
    }
  } catch {
    return new MockMemoProvider().generateMemo(input);
  }

  return new MockMemoProvider().generateMemo(input);
}
