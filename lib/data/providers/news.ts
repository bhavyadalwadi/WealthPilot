import type { SentimentState, TickerSnapshot } from "@/lib/data/normalize/ticker-snapshot";

export type NewsProvider = {
  getNewsData(ticker: string): Promise<
    Pick<TickerSnapshot, "newsSummary" | "sentiment" | "sentimentScore" | "catalystSummary" | "missingFields">
  >;
};

export class MockNewsProvider implements NewsProvider {
  async getNewsData(ticker: string) {
    const seed = ticker.length + ticker.charCodeAt(0);
    const bullish = seed % 3 === 0;
    const bearish = seed % 5 === 0;
    const sentiment: SentimentState = bullish ? "bullish" : bearish ? "bearish" : "neutral";

    return {
      newsSummary: bullish
        ? [`${ticker} benefits from stronger-than-expected thematic demand.`]
        : bearish
          ? [`${ticker} faces mixed sentiment after a cautious sell-side note.`]
          : [`${ticker} is trading on a neutral news tape with no dominant headline.`],
      sentiment,
      sentimentScore: bullish ? 76 : bearish ? 39 : 56,
      catalystSummary: bullish
        ? ["Analyst tone has improved.", "Momentum narrative remains constructive."]
        : bearish
          ? ["Headline risk is elevated.", "Narrative quality is mixed."]
          : ["Catalyst picture is balanced.", "No major narrative shift is confirmed."],
      missingFields: [] as string[],
    };
  }
}
