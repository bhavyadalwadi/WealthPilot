import { MODE_CONFIG } from "@/lib/config/modes";
import type { AnalysisMode, DecisionIntent } from "@/lib/schemas/analysis";

type HeroPanelProps = {
  mode: AnalysisMode;
  intent: DecisionIntent;
};

export function HeroPanel({ mode, intent }: HeroPanelProps) {
  return (
    <section className="hero">
      <div className="hero__copy">
        <p className="eyebrow">Intent-first investing workspace</p>
        <h2>Pick the question. Let the system do the analyst work.</h2>
        <p className="hero__text">
          The interface changes its form, scoring emphasis, and response structure around the exact
          trading decision you are trying to make.
        </p>
      </div>

      <div className="hero__panel">
        <div className="hero__stat">
          <span>Mode</span>
          <strong>{MODE_CONFIG[mode].label}</strong>
        </div>
        <div className="hero__stat">
          <span>Intent</span>
          <strong>{intent}</strong>
        </div>
        <div className="hero__stat">
          <span>Output</span>
          <strong>Typed JSON + PM memo shell</strong>
        </div>
      </div>
    </section>
  );
}
