import type { PriceTrend, TickerSnapshot } from "@/lib/data/normalize/ticker-snapshot";

export type MarketProvider = {
  getMarketData(ticker: string): Promise<
    Pick<
      TickerSnapshot,
      | "ticker"
      | "companyName"
      | "lastPrice"
      | "changePercent"
      | "trend"
      | "relativeStrength"
      | "momentumScore"
      | "supportLevels"
      | "resistanceLevels"
      | "breakoutLevel"
      | "breakdownLevel"
      | "averageVolume"
      | "missingFields"
    >
  >;
};

export class MockMarketProvider implements MarketProvider {
  async getMarketData(ticker: string) {
    const seed = seededNumber(ticker);
    const lastPrice = round(40 + seed * 6.5);
    const support1 = round(lastPrice * 0.94);
    const support2 = round(lastPrice * 0.9);
    const resistance1 = round(lastPrice * 1.04);
    const resistance2 = round(lastPrice * 1.09);

    const trend: PriceTrend = seed % 3 === 0 ? "downtrend" : seed % 2 === 0 ? "range" : "uptrend";

    return {
      ticker,
      companyName: `${ticker} Holdings`,
      lastPrice,
      changePercent: round(((seed % 7) - 3) * 1.35),
      trend,
      relativeStrength: 45 + (seed % 45),
      momentumScore: 42 + (seed % 46),
      supportLevels: [support1, support2],
      resistanceLevels: [resistance1, resistance2],
      breakoutLevel: resistance1,
      breakdownLevel: support1,
      averageVolume: Math.round(700000 + seed * 12000),
      missingFields: [] as string[],
    };
  }
}

function seededNumber(input: string) {
  return input.split("").reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 3), 0) % 97;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
