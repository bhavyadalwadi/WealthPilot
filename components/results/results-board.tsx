import { SummaryBar } from "@/components/results/summary-bar";
import { DecisionCard } from "@/components/results/decision-card";
import { SignalCard } from "@/components/results/signal-card";
import { ActionQueue } from "@/components/results/action-queue";
import { PromptCard } from "@/components/results/prompt-card";
import type { AnalysisMode, AnalysisResponse } from "@/lib/schemas/analysis";

type ResultsBoardProps = {
  mode: AnalysisMode;
  result: AnalysisResponse | null;
  error: string | null;
  pending: boolean;
};

export function ResultsBoard({ mode, result, error, pending }: ResultsBoardProps) {
  if (pending) {
    return (
      <div className="results">
        <div className="empty-state">
          <p className="eyebrow">Working</p>
          <h4>Building the PM brief.</h4>
          <p className="muted-copy">The mock API is shaping a structured response for this mode.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="results">
        <div className="empty-state">
          <p className="eyebrow">Request error</p>
          <h4>The analysis request failed.</h4>
          <p className="muted-copy">{error}</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="results">
        <div className="empty-state">
          <p className="eyebrow">Ready</p>
          <h4>Generate the first PM brief.</h4>
          <p className="muted-copy">
            The app will return typed JSON plus a memo shell and action queue specific to the
            selected workflow.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="results">
      <SummaryBar result={result} />

      <div className="result-grid">
        <DecisionCard result={result} />
        <SignalCard result={result} />
      </div>

      <ActionQueue result={result} mode={mode} />
      <PromptCard result={result} />
    </div>
  );
}
