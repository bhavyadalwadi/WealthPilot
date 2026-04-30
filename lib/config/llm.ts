import type { FormFieldConfig, LlmProvider, ReasoningEffort } from "@/lib/schemas/analysis";

export const DEFAULT_LLM_PROVIDER: LlmProvider = "mock";
export const DEFAULT_LLM_MODEL = "pm-memo-mock-v1";
export const DEFAULT_LLM_REASONING: ReasoningEffort = "medium";

export const LLM_PROVIDER_OPTIONS: LlmProvider[] = ["mock", "openai", "openai-compatible"];
export const LLM_REASONING_OPTIONS: ReasoningEffort[] = ["minimal", "low", "medium", "high"];

export const LLM_FIELD_CONFIG: FormFieldConfig[] = [
  {
    name: "llmProvider",
    label: "Memo provider",
    type: "select",
    options: [...LLM_PROVIDER_OPTIONS],
  },
  {
    name: "llmModel",
    label: "Memo model",
    type: "text",
    placeholder: "gpt-5-mini or custom deployment model",
  },
  {
    name: "llmReasoning",
    label: "Memo reasoning",
    type: "select",
    options: [...LLM_REASONING_OPTIONS],
  },
];
