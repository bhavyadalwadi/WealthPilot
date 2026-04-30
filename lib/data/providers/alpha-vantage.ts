import type { TickerSnapshot } from "@/lib/data/normalize/ticker-snapshot";
import type { EarningsProvider } from "@/lib/data/providers/earnings";
import { MockEarningsProvider } from "@/lib/data/providers/earnings";
import type { MarketProvider } from "@/lib/data/providers/market";
import { MockMarketProvider } from "@/lib/data/providers/market";
import type { NewsProvider } from "@/lib/data/providers/news";
import { MockNewsProvider } from "@/lib/data/providers/news";
import type { OptionsProvider } from "@/lib/data/providers/options";
import { MockOptionsProvider } from "@/lib/data/providers/options";

const DEFAULT_BASE_URL = "https://www.alphavantage.co/query";

type DailyBar = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type NewsArticle = {
  title?: string;
  summary?: string;
  overall_sentiment_score?: string | number;
  overall_sentiment_label?: string;
  time_published?: string;
  ticker_sentiment?: Array<{
    ticker?: string;
    relevance_score?: string | number;
    ticker_sentiment_score?: string | number;
    ticker_sentiment_label?: string;
  }>;
};

type OptionsContract = {
  contractID?: string;
  contractId?: string;
  expiration?: string;
  expiration_date?: string;
  expiry?: string;
  strike?: string | number;
  strike_price?: string | number;
  type?: string;
  contract_type?: string;
  option_type?: string;
  bid?: string | number;
  ask?: string | number;
  mark?: string | number;
  last?: string | number;
  last_price?: string | number;
  volume?: string | number;
  open_interest?: string | number;
  implied_volatility?: string | number;
  iv?: string | number;
  delta?: string | number;
};

export type AlphaVantageConfig = {
  apiKey: string;
  baseUrl?: string;
};

class ProviderError extends Error {
  constructor(message: string, readonly missingField: string) {
    super(message);
  }
}

class AlphaVantageClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(config: AlphaVantageConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || DEFAULT_BASE_URL;
  }

  async fetchJson<T>(params: Record<string, string>): Promise<T> {
    const url = this.buildUrl(params);
    const response = await fetch(url, { next: { revalidate: 300 } });

    if (!response.ok) {
      throw new Error(`Alpha Vantage request failed with ${response.status}.`);
    }

    const payload = (await response.json()) as Record<string, unknown>;
    this.assertPayload(payload);
    return payload as T;
  }

  async fetchText(params: Record<string, string>): Promise<string> {
    const url = this.buildUrl(params);
    const response = await fetch(url, { next: { revalidate: 300 } });

    if (!response.ok) {
      throw new Error(`Alpha Vantage request failed with ${response.status}.`);
    }

    const text = await response.text();
    const trimmed = text.trim();
    if (!trimmed) {
      throw new Error("Alpha Vantage returned an empty response.");
    }
    if (trimmed.startsWith("{")) {
      const payload = JSON.parse(trimmed) as Record<string, unknown>;
      this.assertPayload(payload);
    }

    return text;
  }

  private buildUrl(params: Record<string, string>) {
    const search = new URLSearchParams({ ...params, apikey: this.apiKey });
    return `${this.baseUrl}?${search.toString()}`;
  }

  private assertPayload(payload: Record<string, unknown>) {
    const message = [payload["Error Message"], payload["Information"], payload["Note"]].find(
      (value): value is string => typeof value === "string" && value.trim().length > 0,
    );

    if (message) {
      throw new Error(message);
    }
  }
}

export class AlphaVantageMarketProvider implements MarketProvider {
  private readonly fallback = new MockMarketProvider();

  constructor(private readonly client: AlphaVantageClient) {}

  async getMarketData(ticker: string) {
    try {
      const [overview, quotePayload, dailyPayload] = await Promise.all([
        this.client.fetchJson<Record<string, unknown>>({
          function: "OVERVIEW",
          symbol: ticker,
        }),
        this.client.fetchJson<Record<string, unknown>>({
          function: "GLOBAL_QUOTE",
          symbol: ticker,
        }),
        this.client.fetchJson<Record<string, unknown>>({
          function: "TIME_SERIES_DAILY",
          symbol: ticker,
          outputsize: "compact",
        }),
      ]);

      const bars = parseDailyBars(dailyPayload);
      if (bars.length < 20) {
        throw new ProviderError(`Not enough daily bars returned for ${ticker}.`, "marketHistory");
      }

      const quote = readGlobalQuote(quotePayload);
      const lastBar = bars[0];
      const close20 = bars[Math.min(19, bars.length - 1)]?.close ?? lastBar.close;
      const close50 = bars[Math.min(49, bars.length - 1)]?.close ?? close20;
      const sma20 = average(bars.slice(0, Math.min(20, bars.length)).map((bar) => bar.close));
      const sma50 = average(bars.slice(0, Math.min(50, bars.length)).map((bar) => bar.close));
      const latestPrice = quote.price ?? lastBar.close;
      const changePercent = quote.changePercent ?? percentChange(latestPrice, bars[1]?.close ?? close20);
      const recent10 = bars.slice(0, Math.min(10, bars.length));
      const recent20 = bars.slice(0, Math.min(20, bars.length));
      const supportNear = round(Math.min(...recent10.map((bar) => bar.low)));
      const supportFar = round(Math.min(...recent20.map((bar) => bar.low)));
      const resistanceNear = round(Math.max(...recent10.map((bar) => bar.high)));
      const resistanceFar = round(Math.max(...recent20.map((bar) => bar.high)));
      const fourteenDayReturn = percentChange(latestPrice, bars[Math.min(13, bars.length - 1)]?.close ?? close20);
      const oneMonthReturn = percentChange(latestPrice, close20);
      const trend: TickerSnapshot["trend"] =
        latestPrice > sma20 && sma20 >= sma50
          ? "uptrend"
          : latestPrice < sma20 && sma20 <= sma50
            ? "downtrend"
            : "range";

      return {
        ticker,
        companyName: readString(overview["Name"]) || readString(overview["Symbol"]) || ticker,
        lastPrice: round(latestPrice),
        changePercent: round(changePercent),
        trend,
        relativeStrength: clamp(Math.round(50 + fourteenDayReturn * 2.2), 1, 99),
        momentumScore: clamp(
          Math.round(
            50 +
              oneMonthReturn * 1.8 +
              (latestPrice > sma20 ? 8 : -8) +
              (latestPrice > sma50 ? 6 : -6),
          ),
          1,
          99,
        ),
        supportLevels: [supportNear, supportFar],
        resistanceLevels: [resistanceNear, resistanceFar],
        breakoutLevel: resistanceNear,
        breakdownLevel: supportNear,
        averageVolume: Math.round(average(recent20.map((bar) => bar.volume))),
        missingFields: [] as string[],
      };
    } catch (error) {
      return this.withFallback(ticker, error, this.fallback.getMarketData.bind(this.fallback), "marketData");
    }
  }

  private async withFallback<T extends { missingFields: string[] }>(
    ticker: string,
    error: unknown,
    fallback: (ticker: string) => Promise<T>,
    missingField: string,
  ) {
    const data = await fallback(ticker);
    return {
      ...data,
      missingFields: [...data.missingFields, formatProviderFailure(missingField, error)],
    };
  }
}

export class AlphaVantageNewsProvider implements NewsProvider {
  private readonly fallback = new MockNewsProvider();

  constructor(private readonly client: AlphaVantageClient) {}

  async getNewsData(ticker: string) {
    try {
      const payload = await this.client.fetchJson<{ feed?: NewsArticle[] }>({
        function: "NEWS_SENTIMENT",
        tickers: ticker,
        limit: "6",
        sort: "LATEST",
      });

      const feed = Array.isArray(payload.feed) ? payload.feed : [];
      if (!feed.length) {
        throw new ProviderError(`No news sentiment data returned for ${ticker}.`, "newsData");
      }

      const scored = feed
        .map((article) => ({
          article,
          score: extractTickerSentiment(article, ticker),
        }))
        .filter((entry) => entry.score !== null);

      const averageSentiment =
        scored.length > 0
          ? average(scored.map((entry) => entry.score as number))
          : average(
              feed
                .map((article) => readNumber(article.overall_sentiment_score))
                .filter((value): value is number => typeof value === "number"),
            );

      const normalizedScore = clamp(Math.round(((averageSentiment || 0) + 1) * 50), 1, 99);
      const sentiment: TickerSnapshot["sentiment"] =
        normalizedScore >= 65 ? "bullish" : normalizedScore <= 45 ? "bearish" : "neutral";

      return {
        newsSummary: feed
          .slice(0, 3)
          .map((article) => readString(article.title) || readString(article.summary))
          .filter((value): value is string => Boolean(value)),
        sentiment,
        sentimentScore: normalizedScore,
        catalystSummary: feed
          .slice(0, 3)
          .map((article) => summarizeCatalyst(article))
          .filter((value): value is string => Boolean(value)),
        missingFields: [] as string[],
      };
    } catch (error) {
      return this.withFallback(ticker, error, this.fallback.getNewsData.bind(this.fallback), "newsData");
    }
  }

  private async withFallback<T extends { missingFields: string[] }>(
    ticker: string,
    error: unknown,
    fallback: (ticker: string) => Promise<T>,
    missingField: string,
  ) {
    const data = await fallback(ticker);
    return {
      ...data,
      missingFields: [...data.missingFields, formatProviderFailure(missingField, error)],
    };
  }
}

export class AlphaVantageEarningsProvider implements EarningsProvider {
  private readonly fallback = new MockEarningsProvider();

  constructor(private readonly client: AlphaVantageClient) {}

  async getEarningsData(ticker: string) {
    try {
      const csv = await this.client.fetchText({
        function: "EARNINGS_CALENDAR",
        symbol: ticker,
        horizon: "3month",
      });
      const rows = parseCsv(csv);
      const match = rows[0];
      const reportDate = match?.reportDate || match?.fiscalDateEnding || match?.date;
      if (!reportDate) {
        const earningsTiming: TickerSnapshot["earningsTiming"] = "none";
        return {
          earningsDate: "TBD",
          earningsTiming,
          missingFields: ["earningsDate"],
        };
      }

      const earningsTiming: TickerSnapshot["earningsTiming"] = classifyEarningsTiming(reportDate);
      return {
        earningsDate: reportDate,
        earningsTiming,
        missingFields: [] as string[],
      };
    } catch (error) {
      return this.withFallback(ticker, error, this.fallback.getEarningsData.bind(this.fallback), "earningsData");
    }
  }

  private async withFallback<T extends { missingFields: string[] }>(
    ticker: string,
    error: unknown,
    fallback: (ticker: string) => Promise<T>,
    missingField: string,
  ) {
    const data = await fallback(ticker);
    return {
      ...data,
      missingFields: [...data.missingFields, formatProviderFailure(missingField, error)],
    };
  }
}

export class AlphaVantageOptionsProvider implements OptionsProvider {
  private readonly fallback = new MockOptionsProvider();

  constructor(private readonly client: AlphaVantageClient) {}

  async getOptionsData(ticker: string) {
    try {
      const payload = await this.client.fetchJson<{ data?: OptionsContract[]; contracts?: OptionsContract[] }>({
        function: "REALTIME_OPTIONS",
        symbol: ticker,
        require_greeks: "true",
      });

      const contracts = extractOptionsContracts(payload);
      if (!contracts.length) {
        throw new ProviderError(`No options chain returned for ${ticker}.`, "optionsData");
      }

      const targetContracts = selectNearestContracts(contracts);
      const ivs = targetContracts
        .map((contract) => normalizeIv(readNumber(contract.implied_volatility) ?? readNumber(contract.iv)))
        .filter((value): value is number => typeof value === "number");
      const avgIv = ivs.length ? average(ivs) : null;
      const ivPercentile = estimateIvPercentile(avgIv);
      const totalCallVolume = sum(
        targetContracts
          .filter((contract) => readOptionType(contract) === "call")
          .map((contract) => readNumber(contract.volume) ?? 0),
      );
      const totalPutVolume = sum(
        targetContracts
          .filter((contract) => readOptionType(contract) === "put")
          .map((contract) => readNumber(contract.volume) ?? 0),
      );
      const totalOpenInterest = sum(targetContracts.map((contract) => readNumber(contract.open_interest) ?? 0));
      const avgSpread = average(
        targetContracts
          .map((contract) => {
            const bid = readNumber(contract.bid);
            const ask = readNumber(contract.ask);
            return bid !== null && ask !== null && ask >= bid ? ask - bid : null;
          })
          .filter((value): value is number => typeof value === "number"),
      );
      const volumeRatio = totalCallVolume > 0 ? totalPutVolume / totalCallVolume : null;
      const flow: TickerSnapshot["unusualOptionsFlow"] =
        volumeRatio !== null && volumeRatio >= 1.2
          ? "bearish"
          : volumeRatio !== null && volumeRatio <= 0.8
            ? "bullish"
            : "neutral";
      const ivRegime: TickerSnapshot["ivRegime"] =
        ivPercentile >= 70 ? "elevated" : ivPercentile <= 35 ? "low" : "normal";
      const liquidityScore = clamp(
        Math.round(
          30 +
            Math.log10(totalOpenInterest + 1) * 18 +
            Math.log10(totalCallVolume + totalPutVolume + 1) * 12 -
            Math.min(20, (avgSpread || 0) * 8),
        ),
        1,
        99,
      );

      return {
        ivRegime,
        ivPercentile,
        unusualOptionsFlow: flow,
        optionsLiquidityScore: liquidityScore,
        coveredCallReady: ivPercentile >= 45 && liquidityScore >= 55,
        cashSecuredPutReady: liquidityScore >= 50 && flow !== "bearish",
        pmccReady: liquidityScore >= 65 && flow !== "bearish" && ivPercentile <= 80,
        missingFields: [] as string[],
      };
    } catch (error) {
      return this.withFallback(ticker, error, this.fallback.getOptionsData.bind(this.fallback), "optionsData");
    }
  }

  private async withFallback<T extends { missingFields: string[] }>(
    ticker: string,
    error: unknown,
    fallback: (ticker: string) => Promise<T>,
    missingField: string,
  ) {
    const data = await fallback(ticker);
    return {
      ...data,
      missingFields: [...data.missingFields, formatProviderFailure(missingField, error)],
    };
  }
}

export function createAlphaVantageProviders(config: AlphaVantageConfig) {
  const client = new AlphaVantageClient(config);
  return {
    market: new AlphaVantageMarketProvider(client),
    news: new AlphaVantageNewsProvider(client),
    earnings: new AlphaVantageEarningsProvider(client),
    options: new AlphaVantageOptionsProvider(client),
  };
}

function readGlobalQuote(payload: Record<string, unknown>) {
  const raw = payload["Global Quote"];
  if (!raw || typeof raw !== "object") {
    return { price: null, changePercent: null };
  }

  const quote = raw as Record<string, unknown>;
  const changePercentText = readString(quote["10. change percent"]);

  return {
    price: readNumber(quote["05. price"]),
    changePercent: changePercentText ? Number(changePercentText.replace("%", "")) : null,
  };
}

function parseDailyBars(payload: Record<string, unknown>): DailyBar[] {
  const series = payload["Time Series (Daily)"];
  if (!series || typeof series !== "object") {
    return [];
  }

  return Object.entries(series as Record<string, Record<string, unknown>>)
    .map(([date, row]) => ({
      date,
      open: readNumber(row["1. open"]) ?? 0,
      high: readNumber(row["2. high"]) ?? 0,
      low: readNumber(row["3. low"]) ?? 0,
      close: readNumber(row["4. close"]) ?? 0,
      volume: readNumber(row["5. volume"]) ?? 0,
    }))
    .filter((bar) => bar.close > 0)
    .sort((left, right) => right.date.localeCompare(left.date));
}

function parseCsv(input: string) {
  const lines = input
    .trim()
    .split(/\r?\n/)
    .filter(Boolean);
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

function splitCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values.map((value) => value.trim());
}

function extractTickerSentiment(article: NewsArticle, ticker: string) {
  const items = Array.isArray(article.ticker_sentiment) ? article.ticker_sentiment : [];
  const match = items.find((item) => item.ticker?.toUpperCase() === ticker.toUpperCase());
  if (!match) return null;

  return readNumber(match.ticker_sentiment_score);
}

function summarizeCatalyst(article: NewsArticle) {
  const title = readString(article.title);
  const summary = readString(article.summary);
  if (title && summary) {
    return `${title} ${summary}`.slice(0, 180);
  }
  return title || summary || null;
}

function classifyEarningsTiming(reportDate: string): TickerSnapshot["earningsTiming"] {
  const target = new Date(`${reportDate}T00:00:00Z`);
  const today = new Date();
  const differenceDays = Math.round((target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
  if (differenceDays >= 0) return "upcoming";
  if (differenceDays >= -30) return "recent";
  return "none";
}

function extractOptionsContracts(payload: { data?: OptionsContract[]; contracts?: OptionsContract[]; options?: OptionsContract[] }) {
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.contracts)) return payload.contracts;
  if (Array.isArray(payload.options)) return payload.options;
  return [];
}

function selectNearestContracts(contracts: OptionsContract[]) {
  const withDates = contracts
    .map((contract) => ({
      contract,
      expiration: readExpiration(contract),
      strike: readNumber(contract.strike) ?? readNumber(contract.strike_price) ?? null,
      delta: readNumber(contract.delta),
    }))
    .filter((entry) => Boolean(entry.expiration) && typeof entry.strike === "number" && entry.strike > 0) as Array<{
      contract: OptionsContract;
      expiration: string;
      strike: number;
      delta: number | null;
    }>;

  if (!withDates.length) return contracts.slice(0, 12);

  const today = new Date().toISOString().slice(0, 10);
  const futureDates = [...new Set(withDates.map((entry) => entry.expiration).filter((date) => date >= today))].sort();
  const selectedExpiration = futureDates[0] || withDates[0].expiration;
  const sameExpiry = withDates.filter((entry) => entry.expiration === selectedExpiration);
  const rankedByDelta = sameExpiry
    .filter((entry): entry is typeof entry & { delta: number } => typeof entry.delta === "number")
    .sort((left, right) => Math.abs(Math.abs(left.delta) - 0.5) - Math.abs(Math.abs(right.delta) - 0.5));

  if (rankedByDelta.length >= 6) {
    return rankedByDelta.slice(0, 12).map((entry) => entry.contract);
  }

  const orderedStrikes = sameExpiry.map((entry) => entry.strike).sort((left, right) => left - right);
  const medianStrike = orderedStrikes[Math.floor(orderedStrikes.length / 2)] ?? orderedStrikes[0] ?? 100;

  return sameExpiry
    .sort((left, right) => Math.abs(left.strike - medianStrike) - Math.abs(right.strike - medianStrike))
    .slice(0, 12)
    .map((entry) => entry.contract);
}

function readExpiration(contract: OptionsContract) {
  return readString(contract.expiration) || readString(contract.expiration_date) || readString(contract.expiry);
}

function readOptionType(contract: OptionsContract) {
  return (
    readString(contract.type)?.toLowerCase() ||
    readString(contract.contract_type)?.toLowerCase() ||
    readString(contract.option_type)?.toLowerCase() ||
    "unknown"
  );
}

function normalizeIv(value: number | null) {
  if (value === null) return null;
  return value <= 1 ? value * 100 : value;
}

function estimateIvPercentile(iv: number | null) {
  if (iv === null) return 50;
  if (iv >= 65) return 90;
  if (iv >= 50) return 78;
  if (iv >= 35) return 62;
  if (iv >= 22) return 45;
  return 28;
}

function formatProviderFailure(field: string, error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown provider error.";
  return `${field}: ${message}`;
}

function average(values: number[]) {
  if (!values.length) return 0;
  return sum(values) / values.length;
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function percentChange(current: number, prior: number) {
  if (!prior) return 0;
  return ((current - prior) / prior) * 100;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}
