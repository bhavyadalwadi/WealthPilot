"use client";

import { useState, useTransition } from "react";
import { SideRail } from "@/components/layout/side-rail";
import { HeroPanel } from "@/components/layout/hero-panel";
import { DynamicForm } from "@/components/forms/dynamic-form";
import { ResultsBoard } from "@/components/results/results-board";
import { MODE_CONFIG, DEFAULT_INTENT, DEFAULT_MODE, INTENT_OPTIONS } from "@/lib/config/modes";
import type {
  AnalysisMode,
  AnalysisResponse,
  DecisionIntent,
  FormPayload,
} from "@/lib/schemas/analysis";

const routeByMode: Record<AnalysisMode, string> = {
  ticker: "/api/analyze",
  portfolio: "/api/portfolio",
  income: "/api/income",
  full: "/api/review",
};

export function AppShell() {
  const [mode, setMode] = useState<AnalysisMode>(DEFAULT_MODE);
  const [intent, setIntent] = useState<DecisionIntent>(DEFAULT_INTENT);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleGenerate(payload: FormPayload) {
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch(routeByMode[mode], {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            mode,
            intent,
          }),
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = (await response.json()) as AnalysisResponse;
        setResult(data);
      } catch (requestError) {
        const message =
          requestError instanceof Error ? requestError.message : "Unknown request failure";
        setError(message);
        setResult(null);
      }
    });
  }

  return (
    <div className="app-shell">
      <SideRail
        mode={mode}
        intent={intent}
        modes={MODE_CONFIG}
        intents={INTENT_OPTIONS}
        onModeChange={(nextMode) => {
          setMode(nextMode);
          setResult(null);
        }}
        onIntentChange={(nextIntent) => {
          setIntent(nextIntent);
          setResult(null);
        }}
      />

      <main className="workspace">
        <HeroPanel mode={mode} intent={intent} />

        <section className="main-grid">
          <section className="panel">
            <div className="panel__header">
              <div>
                <p className="eyebrow">Input</p>
                <h3>{MODE_CONFIG[mode].label}</h3>
              </div>
            </div>

            <DynamicForm mode={mode} intent={intent} pending={isPending} onSubmit={handleGenerate} />
          </section>

          <section className="panel">
            <div className="panel__header">
              <div>
                <p className="eyebrow">Output</p>
                <h3>Decision Board</h3>
              </div>
            </div>

            <ResultsBoard mode={mode} result={result} error={error} pending={isPending} />
          </section>
        </section>
      </main>
    </div>
  );
}
