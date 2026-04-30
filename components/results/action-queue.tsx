import type { AnalysisMode, AnalysisResponse } from "@/lib/schemas/analysis";

type ActionQueueProps = {
  mode: AnalysisMode;
  result: AnalysisResponse;
};

export function ActionQueue({ mode, result }: ActionQueueProps) {
  return (
    <>
      <section className="result-section">
        <p className="eyebrow">Key signals</p>
        <div className="split-grid">
          <div>
            <h4>Constructive signals</h4>
            <ul className="result-list">
              {result.signals.positives.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Risk gates</h4>
            <ul className="result-list">
              {result.signals.risks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="result-section">
        <p className="eyebrow">Priority actions</p>
        <h4>{mode === "portfolio" || mode === "full" ? "Action queue" : "Next moves"}</h4>
        <ul className="result-list">
          {result.topActions.map((item) => (
            <li key={`${item.ticker}-${item.action}`}>
              <strong>{item.ticker}</strong> - {item.action}. {item.reason}
            </li>
          ))}
        </ul>
      </section>

      <section className="result-section">
        <p className="eyebrow">Contract notes</p>
        <h4>Missing data and handoff boundaries</h4>
        <ul className="result-list">
          {result.missingData.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </>
  );
}
