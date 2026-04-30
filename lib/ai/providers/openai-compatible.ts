import { buildMemoSystemPrompt, buildMemoUserPrompt } from "@/lib/ai/prompt-builder";
import type { MemoInput, MemoProvider, MemoResult } from "@/lib/ai/types";
import type { LlmProvider } from "@/lib/schemas/analysis";

type CompatibleConfig = {
  provider: Extract<LlmProvider, "openai" | "openai-compatible">;
  apiKey: string;
  baseUrl: string;
};

export class OpenAICompatibleMemoProvider implements MemoProvider {
  constructor(private readonly config: CompatibleConfig) {}

  async generateMemo(input: MemoInput): Promise<MemoResult> {
    const response = await fetch(`${this.config.baseUrl}/responses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: input.request.llmModel,
        reasoning: {
          effort: input.request.llmReasoning,
        },
        text: {
          format: {
            type: "text",
          },
        },
        input: [
          {
            role: "developer",
            content: [{ type: "input_text", text: buildMemoSystemPrompt() }],
          },
          {
            role: "user",
            content: [{ type: "input_text", text: buildMemoUserPrompt(input) }],
          },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`LLM request failed with ${response.status}: ${body}`);
    }

    const body = (await response.json()) as {
      output_text?: string;
    };

    return {
      content: body.output_text || "No memo text returned by the configured LLM provider.",
      provider: this.config.provider,
      model: input.request.llmModel,
      reasoning: input.request.llmReasoning,
      source: "llm",
    };
  }
}
