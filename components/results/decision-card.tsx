import type { AnalysisResponse } from "@/lib/schemas/analysis";

export function DecisionCard({ result }: { result: AnalysisResponse }) {
  return (
    <article className="result-card">
      <span className="result-kicker">PM read</span>
      <h4>{result.focusLabel}</h4>
      <p className="muted-copy">{result.summary}</p>
      <div className="badge-row">
        <span className="badge badge--forest">{result.recommendation.urgency}</span>
        <span className="badge badge--gold">{result.recommendation.timeHorizon}</span>
        <span className="badge badge--danger">{result.intent}</span>
      </div>
    </article>
  );
}
