import type { AnalysisRequest, PortfolioPosition } from "@/lib/schemas/analysis";
import type { TickerSnapshot } from "@/lib/data/normalize/ticker-snapshot";

export type PositionSnapshot = PortfolioPosition & {
  marketPrice: number;
  marketValue: number;
  unrealizedPercent: number;
  weightEstimate: number;
};

export type PortfolioSnapshot = {
  positions: PositionSnapshot[];
  watchlist: string[];
  totalMarketValue: number;
  concentrationRisk: "low" | "moderate" | "high";
  cashAvailable: number;
  missingFields: string[];
};

export type AnalysisDataContext = {
  mode: AnalysisRequest["mode"];
  primaryTicker: TickerSnapshot | null;
  tickerSnapshots: Record<string, TickerSnapshot>;
  portfolio: PortfolioSnapshot | null;
  missingData: string[];
};
