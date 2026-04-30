import type { AnalysisResponse } from "@/lib/schemas/analysis";

export function SummaryBar({ result }: { result: AnalysisResponse }) {
  return (
    <div className="summary-bar">
      <div className="summary-stat">
        <span>Posture</span>
        <strong>{result.recommendation.posture}</strong>
      </div>
      <div className="summary-stat">
        <span>Primary action</span>
        <strong>{result.recommendation.action}</strong>
      </div>
      <div className="summary-stat">
        <span>Confidence</span>
        <strong>{result.recommendation.confidence}</strong>
      </div>
      <div className="summary-stat">
        <span>Engine score</span>
        <strong>{result.score}/100</strong>
      </div>
    </div>
  );
}
