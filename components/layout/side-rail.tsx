import { SelectorList } from "@/components/selectors/selector-list";
import type { AnalysisMode, DecisionIntent } from "@/lib/schemas/analysis";
import type { ModeDefinition } from "@/lib/config/modes";

type SideRailProps = {
  mode: AnalysisMode;
  intent: DecisionIntent;
  modes: Record<AnalysisMode, ModeDefinition>;
  intents: DecisionIntent[];
  onModeChange: (mode: AnalysisMode) => void;
  onIntentChange: (intent: DecisionIntent) => void;
};

export function SideRail({
  mode,
  intent,
  modes,
  intents,
  onModeChange,
  onIntentChange,
}: SideRailProps) {
  return (
    <aside className="rail">
      <div className="rail__brand">
        <div className="brand-mark">N</div>
        <div>
          <p className="eyebrow">Portfolio intelligence</p>
          <h1>Northstar PM Copilot</h1>
        </div>
      </div>

      <div className="rail__block">
        <p className="rail__label">Today&apos;s workflow</p>
        <SelectorList
          items={Object.values(modes).map((item) => ({
            id: item.id,
            title: item.label,
            summary: item.summary,
          }))}
          activeId={mode}
          onSelect={(value) => onModeChange(value as AnalysisMode)}
        />
      </div>

      <div className="rail__block">
        <p className="rail__label">Decision lens</p>
        <SelectorList
          items={intents.map((item) => ({
            id: item,
            title: item,
            summary: "Changes scoring emphasis, output ordering, and recommendation style.",
          }))}
          activeId={intent}
          onSelect={(value) => onIntentChange(value as DecisionIntent)}
        />
      </div>

      <div className="rail__block rail__summary">
        <p className="rail__label">Phase 1 status</p>
        <p className="muted-copy">
          React UI, typed request payloads, and mock server routes are in scope now. Live market
          data and OpenAI memo generation are the next phases.
        </p>
      </div>
    </aside>
  );
}
