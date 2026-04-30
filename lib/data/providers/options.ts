import type { IvRegime, TickerSnapshot } from "@/lib/data/normalize/ticker-snapshot";

export type OptionsProvider = {
  getOptionsData(ticker: string): Promise<
    Pick<
      TickerSnapshot,
      | "ivRegime"
      | "ivPercentile"
      | "unusualOptionsFlow"
      | "optionsLiquidityScore"
      | "coveredCallReady"
      | "cashSecuredPutReady"
      | "pmccReady"
      | "missingFields"
    >
  >;
};

export class MockOptionsProvider implements OptionsProvider {
  async getOptionsData(ticker: string) {
    const seed = ticker.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const ivPercentile = 25 + (seed % 70);
    const ivRegime: IvRegime = ivPercentile >= 70 ? "elevated" : ivPercentile <= 35 ? "low" : "normal";
    const flow: TickerSnapshot["unusualOptionsFlow"] =
      seed % 4 === 0 ? "bearish" : seed % 3 === 0 ? "bullish" : "neutral";
    const liquidity = 45 + (seed % 50);

    return {
      ivRegime,
      ivPercentile,
      unusualOptionsFlow: flow,
      optionsLiquidityScore: liquidity,
      coveredCallReady: ivPercentile >= 45,
      cashSecuredPutReady: ivPercentile >= 40,
      pmccReady: liquidity >= 68 && flow !== "bearish",
      missingFields: [] as string[],
    };
  }
}
