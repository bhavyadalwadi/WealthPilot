import type { AnalysisResponse } from "@/lib/schemas/analysis";

export function SignalCard({ result }: { result: AnalysisResponse }) {
  return (
    <article className="result-card">
      <span className="result-kicker">Score mix</span>
      <h4>Weighted factors</h4>
      <ul className="result-list">
        <li>Thesis: {result.factors.thesis}</li>
        <li>Technicals: {result.factors.technicals}</li>
        <li>Catalysts: {result.factors.catalysts}</li>
        <li>Portfolio fit: {result.factors.portfolioFit}</li>
        <li>Options suitability: {result.factors.optionsSuitability}</li>
      </ul>
    </article>
  );
}
