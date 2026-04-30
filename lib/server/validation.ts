import { ACTION_LABELS } from "@/lib/config/action-labels";
import { DEFAULT_LLM_MODEL, DEFAULT_LLM_PROVIDER, DEFAULT_LLM_REASONING, LLM_PROVIDER_OPTIONS, LLM_REASONING_OPTIONS } from "@/lib/config/llm";
import { INTENT_OPTIONS } from "@/lib/config/modes";
import type {
  AnalysisMode,
  AnalysisRequest,
  DecisionIntent,
  FormPayload,
  FullReviewRequest,
  IncomeRequest,
  Objective,
  OwnershipState,
  PortfolioPosition,
  PortfolioRequest,
  RiskStyle,
  TickerRequest,
  TimeHorizon,
  ValidationErrorResponse,
} from "@/lib/schemas/analysis";

const riskStyles: RiskStyle[] = ["Conservative", "Balanced", "Aggressive"];
const timeHorizons: Exclude<TimeHorizon, "income">[] = ["Swing", "Position", "Long-term"];
const objectives: Objective[] = ["Balanced", "Growth", "Income"];
const ownershipStates: OwnershipState[] = ["No", "Yes"];

type ValidationResult =
  | { ok: true; data: AnalysisRequest }
  | { ok: false; error: ValidationErrorResponse["error"] };

export function validateRequest(
  mode: AnalysisMode,
  rawPayload: unknown,
  expectedIntent?: DecisionIntent,
): ValidationResult {
  if (!isRecord(rawPayload)) {
    return invalid("Request body must be a JSON object.", ["Received non-object payload."]);
  }

  const payload = rawPayload as FormPayload & { intent?: string };
  const details: string[] = [];
  const intent = normalizeIntent(payload.intent, expectedIntent, details);
  const riskStyle = enumValue(payload.riskStyle, riskStyles, "riskStyle", "Balanced", details);
  const cash = parseMoney(payload.cash, "cash", details, false);
  const notes = textValue(payload.notes);
  const llmProvider = enumValue(payload.llmProvider, LLM_PROVIDER_OPTIONS, "llmProvider", DEFAULT_LLM_PROVIDER, details);
  const llmModel = textValue(payload.llmModel) || defaultModelForProvider(llmProvider);
  const llmReasoning = enumValue(
    payload.llmReasoning,
    LLM_REASONING_OPTIONS,
    "llmReasoning",
    DEFAULT_LLM_REASONING,
    details,
  );

  if (!intent) {
    return invalid("Intent is required.", details);
  }

  if (mode === "ticker") {
    const ticker = parseTicker(payload.ticker, "ticker", details);
    const ownIt = enumValue(payload.ownIt, ownershipStates, "ownIt", "No", details) === "Yes";
    const shares = parseMoney(payload.shares, "shares", details, false);
    const avgCost = parseMoney(payload.avgCost, "avgCost", details, false);
    const timeHorizon = enumValue(payload.timeHorizon, timeHorizons, "timeHorizon", "Position", details);

    if (details.length > 0) {
      return invalid("Ticker analysis request is invalid.", details);
    }

    const request: TickerRequest = {
      mode,
      intent,
      riskStyle,
      cash,
      notes,
      llmProvider,
      llmModel,
      llmReasoning,
      ticker,
      ownIt,
      shares,
      avgCost,
      timeHorizon,
    };
    return { ok: true, data: request };
  }

  if (mode === "portfolio") {
    const positions = parsePositions(payload.positions, details);
    const watchlist = parseTickerList(payload.watchlist);
    const objective = enumValue(payload.objective, objectives, "objective", "Balanced", details);
    const constraints = textValue(payload.constraints);

    if (positions.length === 0) {
      details.push("positions must include at least one valid ticker, shares, avgCost row.");
    }

    if (details.length > 0) {
      return invalid("Portfolio analysis request is invalid.", details);
    }

    const request: PortfolioRequest = {
      mode,
      intent,
      riskStyle,
      cash,
      notes,
      llmProvider,
      llmModel,
      llmReasoning,
      positions,
      watchlist,
      objective,
      constraints,
    };
    return { ok: true, data: request };
  }

  if (mode === "income") {
    const ticker = parseTicker(payload.ticker, "ticker", details);
    const ownIt = enumValue(payload.ownIt, ownershipStates, "ownIt", "No", details) === "Yes";
    const shares = parseMoney(payload.shares, "shares", details, false);
    const avgCost = parseMoney(payload.avgCost, "avgCost", details, false);
    const incomeGoal = textValue(payload.incomeGoal) || "Monthly yield";

    if (details.length > 0) {
      return invalid("Income analysis request is invalid.", details);
    }

    const request: IncomeRequest = {
      mode,
      intent,
      riskStyle,
      cash,
      notes,
      llmProvider,
      llmModel,
      llmReasoning,
      ticker,
      ownIt,
      shares,
      avgCost,
      incomeGoal,
    };
    return { ok: true, data: request };
  }

  const positions = parsePositions(payload.positions, details);
  const watchlist = parseTickerList(payload.watchlist);
  const priorityTickers = parseTickerList(payload.priorityTickers);
  const objective = enumValue(payload.objective, objectives, "objective", "Balanced", details);

  if (positions.length === 0) {
    details.push("positions must include at least one valid ticker, shares, avgCost row.");
  }

  if (details.length > 0) {
    return invalid("Full review request is invalid.", details);
  }

  const request: FullReviewRequest = {
    mode,
    intent,
    riskStyle,
    cash,
    notes,
    llmProvider,
    llmModel,
    llmReasoning,
    positions,
    watchlist,
    priorityTickers,
    objective,
  };
  return { ok: true, data: request };
}

function normalizeIntent(
  value: string | undefined,
  expectedIntent: DecisionIntent | undefined,
  details: string[],
): DecisionIntent | null {
  const candidate = (value || expectedIntent) as DecisionIntent | undefined;
  if (!candidate) {
    details.push("intent is required.");
    return null;
  }
  if (!INTENT_OPTIONS.includes(candidate)) {
    details.push(`intent must be one of: ${INTENT_OPTIONS.join(", ")}.`);
    return null;
  }
  return candidate;
}

function parseTicker(value: string | undefined, field: string, details: string[]) {
  const ticker = textValue(value).toUpperCase();
  if (!ticker) {
    details.push(`${field} is required.`);
    return "";
  }
  if (!/^[A-Z.\-]{1,10}$/.test(ticker)) {
    details.push(`${field} must be a valid ticker-style symbol.`);
  }
  return ticker;
}

function parseTickerList(value: string | undefined) {
  return textValue(value)
    .split(/[\n,]/)
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean)
    .filter((item) => /^[A-Z.\-]{1,10}$/.test(item));
}

function parsePositions(value: string | undefined, details: string[]) {
  const positions: PortfolioPosition[] = [];
  const rows = textValue(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  rows.forEach((row, index) => {
    const [tickerRaw, sharesRaw, avgCostRaw] = row.split(",").map((item) => item.trim());
    const ticker = tickerRaw?.toUpperCase() || "";
    const shares = safeNumber(sharesRaw);
    const avgCost = safeNumber(avgCostRaw);

    if (!ticker || !/^[A-Z.\-]{1,10}$/.test(ticker) || !Number.isFinite(shares) || !Number.isFinite(avgCost)) {
      details.push(`positions row ${index + 1} must be formatted as TICKER, shares, avgCost.`);
      return;
    }

    positions.push({ ticker, shares, avgCost });
  });

  return positions;
}

function parseMoney(
  value: string | undefined,
  field: string,
  details: string[],
  required: boolean,
) {
  const text = textValue(value);
  if (!text) {
    if (required) {
      details.push(`${field} is required.`);
    }
    return 0;
  }
  const number = safeNumber(text);
  if (!Number.isFinite(number) || number < 0) {
    details.push(`${field} must be a non-negative number.`);
    return 0;
  }
  return number;
}

function enumValue<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  field: string,
  fallback: T,
  details: string[],
) {
  if (!value) {
    return fallback;
  }
  if (!allowed.includes(value as T)) {
    details.push(`${field} must be one of: ${allowed.join(", ")}.`);
    return fallback;
  }
  return value as T;
}

function safeNumber(input: string | undefined) {
  return Number.parseFloat(String(input || "").replace(/[^0-9.-]/g, ""));
}

function textValue(value: string | undefined) {
  return String(value || "").trim();
}

function invalid(message: string, details: string[]): ValidationResult {
  return {
    ok: false,
    error: {
      code: "INVALID_REQUEST",
      message,
      details,
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isActionLabel(value: string) {
  return ACTION_LABELS.includes(value as (typeof ACTION_LABELS)[number]);
}

function defaultModelForProvider(provider: typeof DEFAULT_LLM_PROVIDER) {
  if (provider === "openai") return "gpt-5-mini";
  if (provider === "openai-compatible") return "openai-compatible-model";
  return DEFAULT_LLM_MODEL;
}
