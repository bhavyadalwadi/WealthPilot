import type { AnalysisHistoryEntry } from "@/lib/schemas/persistence";

type RecentHistoryProps = {
  history: AnalysisHistoryEntry[];
};

export function RecentHistory({ history }: RecentHistoryProps) {
  return (
    <div className="rail__block rail__summary">
      <p className="rail__label">Recent analyses</p>
      {history.length === 0 ? (
        <p className="muted-copy">No saved analysis history yet.</p>
      ) : (
        <ul className="history-list">
          {history.slice(0, 6).map((item) => (
            <li key={item.id} className="history-item">
              <strong>{item.focusLabel}</strong>
              <span>{item.action} · {item.confidence}</span>
              <span>{item.intent}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
