import type { AnalysisResponse } from "@/lib/schemas/analysis";

export function PromptCard({ result }: { result: AnalysisResponse }) {
  return (
    <section className="prompt-card">
      <p className="eyebrow">PM memo</p>
      <h4>
        Memo output via {result.llm.provider} / {result.llm.model}
      </h4>
      <pre>{result.memo}</pre>
      <p className="inline-note">
        Reasoning: {result.llm.reasoning}. Source: {result.llm.source}. The structured prompt
        contract is still available in the API response for debugging.
      </p>
    </section>
  );
}
