import { MemoryCache } from "@/lib/data/cache";
import type { AnalysisDataContext, PortfolioSnapshot, PositionSnapshot } from "@/lib/data/normalize/portfolio-snapshot";
import type { TickerSnapshot } from "@/lib/data/normalize/ticker-snapshot";
import { MockEarningsProvider, type EarningsProvider } from "@/lib/data/providers/earnings";
import { MockMarketProvider, type MarketProvider } from "@/lib/data/providers/market";
import { MockNewsProvider, type NewsProvider } from "@/lib/data/providers/news";
import { MockOptionsProvider, type OptionsProvider } from "@/lib/data/providers/options";
import type { AnalysisRequest } from "@/lib/schemas/analysis";

const tickerCache = new MemoryCache<TickerSnapshot>();

type ProviderBundle = {
  market: MarketProvider;
  news: NewsProvider;
  earnings: EarningsProvider;
  options: OptionsProvider;
};

const defaultProviders: ProviderBundle = {
  market: new MockMarketProvider(),
  news: new MockNewsProvider(),
  earnings: new MockEarningsProvider(),
  options: new MockOptionsProvider(),
};

export async function buildAnalysisDataContext(
  input: AnalysisRequest,
  providers: ProviderBundle = defaultProviders,
): Promise<AnalysisDataContext> {
  const tickers = uniqueTickers(input);
  const snapshots = await Promise.all(tickers.map((ticker) => getTickerSnapshot(ticker, providers)));
  const tickerSnapshots = Object.fromEntries(snapshots.map((snapshot) => [snapshot.ticker, snapshot]));
  const primaryTicker = tickers[0] ? tickerSnapshots[tickers[0]] : null;
  const portfolio = buildPortfolioSnapshot(input, tickerSnapshots);
  const missingData = snapshots.flatMap((snapshot) => snapshot.missingFields).filter(Boolean);

  return {
    mode: input.mode,
    primaryTicker,
    tickerSnapshots,
    portfolio,
    missingData,
  };
}

async function getTickerSnapshot(ticker: string, providers: ProviderBundle): Promise<TickerSnapshot> {
  const cached = tickerCache.get(ticker);
  if (cached) return cached;

  const [market, news, earnings, options] = await Promise.all([
    providers.market.getMarketData(ticker),
    providers.news.getNewsData(ticker),
    providers.earnings.getEarningsData(ticker),
    providers.options.getOptionsData(ticker),
  ]);

  const snapshot: TickerSnapshot = {
    ...market,
    ...news,
    ...earnings,
    ...options,
    missingFields: [...market.missingFields, ...news.missingFields, ...earnings.missingFields, ...options.missingFields],
  };

  tickerCache.set(ticker, snapshot, 5 * 60 * 1000);
  return snapshot;
}

function buildPortfolioSnapshot(
  input: AnalysisRequest,
  tickerSnapshots: Record<string, TickerSnapshot>,
): PortfolioSnapshot | null {
  if (input.mode !== "portfolio" && input.mode !== "full") {
    return null;
  }

  const positions: PositionSnapshot[] = input.positions.map((position) => {
    const marketPrice = tickerSnapshots[position.ticker]?.lastPrice ?? position.avgCost;
    const marketValue = round(position.shares * marketPrice);
    const unrealizedPercent = position.avgCost > 0 ? round(((marketPrice - position.avgCost) / position.avgCost) * 100) : 0;
    return {
      ...position,
      marketPrice,
      marketValue,
      unrealizedPercent,
      weightEstimate: 0,
    };
  });

  const totalMarketValue = round(positions.reduce((sum, position) => sum + position.marketValue, 0));
  const enriched = positions.map((position) => ({
    ...position,
    weightEstimate: totalMarketValue > 0 ? round((position.marketValue / totalMarketValue) * 100) : 0,
  }));
  const maxWeight = Math.max(...enriched.map((position) => position.weightEstimate), 0);

  return {
    positions: enriched,
    watchlist: input.watchlist,
    totalMarketValue,
    concentrationRisk: maxWeight >= 18 ? "high" : maxWeight >= 10 ? "moderate" : "low",
    cashAvailable: input.cash,
    missingFields: [],
  };
}

function uniqueTickers(input: AnalysisRequest) {
  const tickers = new Set<string>();

  if (input.mode === "ticker" || input.mode === "income") {
    tickers.add(input.ticker);
  }

  if (input.mode === "portfolio" || input.mode === "full") {
    input.positions.forEach((position) => tickers.add(position.ticker));
    input.watchlist.forEach((ticker) => tickers.add(ticker));
  }

  if (input.mode === "full") {
    input.priorityTickers.forEach((ticker) => tickers.add(ticker));
  }

  return [...tickers];
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
