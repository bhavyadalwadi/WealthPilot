type SelectorItem = {
  id: string;
  title: string;
  summary: string;
};

type SelectorListProps = {
  items: SelectorItem[];
  activeId: string;
  onSelect: (id: string) => void;
};

export function SelectorList({ items, activeId, onSelect }: SelectorListProps) {
  return (
    <div className="selector-list">
      {items.map((item) => (
        <button
          key={item.id}
          className={`selector-chip${item.id === activeId ? " is-active" : ""}`}
          type="button"
          onClick={() => onSelect(item.id)}
        >
          <span className="selector-chip__title">{item.title}</span>
          <span className="selector-chip__copy">{item.summary}</span>
        </button>
      ))}
    </div>
  );
}
