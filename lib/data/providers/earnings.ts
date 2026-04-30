import type { TickerSnapshot } from "@/lib/data/normalize/ticker-snapshot";

export type EarningsProvider = {
  getEarningsData(ticker: string): Promise<
    Pick<TickerSnapshot, "earningsDate" | "earningsTiming" | "missingFields">
  >;
};

export class MockEarningsProvider implements EarningsProvider {
  async getEarningsData(ticker: string) {
    const seed = ticker.charCodeAt(ticker.length - 1) % 28;
    const day = String((seed % 27) + 1).padStart(2, "0");
    const timing: TickerSnapshot["earningsTiming"] =
      seed % 4 === 0 ? "upcoming" : seed % 4 === 1 ? "recent" : "none";

    return {
      earningsDate: timing === "none" ? "TBD" : `2026-05-${day}`,
      earningsTiming: timing,
      missingFields: timing === "none" ? ["earningsDate"] : [],
    };
  }
}
