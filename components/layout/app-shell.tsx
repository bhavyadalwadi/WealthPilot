"use client";

import { useEffect, useState, useTransition } from "react";
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
import type { AnalysisHistoryEntry, SavedPortfolio, UserProfile } from "@/lib/schemas/persistence";

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
  const [history, setHistory] = useState<AnalysisHistoryEntry[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [portfolios, setPortfolios] = useState<SavedPortfolio[]>([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    void loadPersistence();
  }, []);

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
        void loadHistory();
      } catch (requestError) {
        const message =
          requestError instanceof Error ? requestError.message : "Unknown request failure";
        setError(message);
        setResult(null);
      }
    });
  }

  function handleSaveDefaults(payload: FormPayload) {
    startTransition(async () => {
      try {
        const response = await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            defaultRiskStyle: payload.riskStyle || "Balanced",
            defaultObjective: payload.objective || "Balanced",
            defaultTimeHorizon: payload.timeHorizon || "Position",
            defaultLlmProvider: payload.llmProvider || "mock",
            defaultLlmModel: payload.llmModel || "pm-memo-mock-v1",
            defaultLlmReasoning: payload.llmReasoning || "medium",
          }),
        });
        if (!response.ok) {
          throw new Error("Failed to save defaults.");
        }
        const nextProfile = (await response.json()) as UserProfile;
        setProfile(nextProfile);
      } catch (saveError) {
        const message = saveError instanceof Error ? saveError.message : "Failed to save defaults.";
        setError(message);
      }
    });
  }

  function handleLoadPortfolio(portfolioId: string) {
    setSelectedPortfolioId(portfolioId);
  }

  function handleSavePortfolio(payload: FormPayload) {
    startTransition(async () => {
      try {
        const response = await fetch("/api/portfolios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: selectedPortfolioId || undefined,
            name: payload.portfolioName || "Untitled portfolio",
            positions: parsePositions(payload.positions || ""),
            watchlist: parseTickerList(payload.watchlist || ""),
            cash: parseNumber(payload.cash || "0"),
            objective: payload.objective || "Balanced",
            riskStyle: payload.riskStyle || "Balanced",
            notes: payload.notes || "",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save portfolio.");
        }

        const saved = (await response.json()) as SavedPortfolio;
        setSelectedPortfolioId(saved.id);
        await loadPortfolios();
      } catch (saveError) {
        const message = saveError instanceof Error ? saveError.message : "Failed to save portfolio.";
        setError(message);
      }
    });
  }

  function handleDeletePortfolio(portfolioId: string) {
    if (!portfolioId) return;

    startTransition(async () => {
      try {
        const response = await fetch(`/api/portfolios/${portfolioId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete portfolio.");
        }

        setSelectedPortfolioId("");
        await loadPortfolios();
      } catch (deleteError) {
        const message = deleteError instanceof Error ? deleteError.message : "Failed to delete portfolio.";
        setError(message);
      }
    });
  }

  async function loadPersistence() {
    const [profileResponse, historyResponse, portfolioResponse] = await Promise.all([
      fetch("/api/profile"),
      fetch("/api/history"),
      fetch("/api/portfolios"),
    ]);

    if (profileResponse.ok) {
      setProfile((await profileResponse.json()) as UserProfile);
    }

    if (historyResponse.ok) {
      setHistory((await historyResponse.json()) as AnalysisHistoryEntry[]);
    }

    if (portfolioResponse.ok) {
      setPortfolios((await portfolioResponse.json()) as SavedPortfolio[]);
    }
  }

  async function loadHistory() {
    const response = await fetch("/api/history");
    if (response.ok) {
      setHistory((await response.json()) as AnalysisHistoryEntry[]);
    }
  }

  async function loadPortfolios() {
    const response = await fetch("/api/portfolios");
    if (response.ok) {
      setPortfolios((await response.json()) as SavedPortfolio[]);
    }
  }

  const selectedPortfolio =
    selectedPortfolioId ? portfolios.find((portfolio) => portfolio.id === selectedPortfolioId) ?? null : null;

  return (
    <div className="app-shell">
      <SideRail
        mode={mode}
        intent={intent}
        modes={MODE_CONFIG}
        intents={INTENT_OPTIONS}
        history={history}
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

            <DynamicForm
              mode={mode}
              intent={intent}
              pending={isPending}
              defaults={profile}
              portfolios={portfolios}
              selectedPortfolioId={selectedPortfolioId}
              loadedPortfolio={selectedPortfolio}
              onSubmit={handleGenerate}
              onSaveDefaults={handleSaveDefaults}
              onLoadPortfolio={handleLoadPortfolio}
              onSavePortfolio={handleSavePortfolio}
              onDeletePortfolio={handleDeletePortfolio}
            />
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

function parsePositions(input: string) {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [ticker, shares, avgCost] = line.split(",").map((item) => item.trim());
      return {
        ticker: (ticker || "").toUpperCase(),
        shares: parseNumber(shares || "0"),
        avgCost: parseNumber(avgCost || "0"),
      };
    })
    .filter((position) => position.ticker);
}

function parseTickerList(input: string) {
  return input
    .split(/[\n,]/)
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);
}

function parseNumber(input: string) {
  const value = Number.parseFloat(String(input).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(value) ? value : 0;
}
