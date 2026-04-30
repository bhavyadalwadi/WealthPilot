import { LLM_FIELD_CONFIG } from "@/lib/config/llm";
import type { AnalysisMode, DecisionIntent, FormFieldConfig } from "@/lib/schemas/analysis";

export type ModeDefinition = {
  id: AnalysisMode;
  label: string;
  summary: string;
};

export const DEFAULT_MODE: AnalysisMode = "ticker";
export const DEFAULT_INTENT: DecisionIntent = "Should I buy this?";

export const INTENT_OPTIONS: DecisionIntent[] = [
  "Should I buy this?",
  "Should I add more?",
  "Should I trim or sell?",
  "Should I average down?",
  "Is this a breakout?",
  "Is this good for covered calls?",
  "Should I sell a CSP instead?",
];

export const MODE_CONFIG: Record<AnalysisMode, ModeDefinition> = {
  ticker: {
    id: "ticker",
    label: "Research This Ticker",
    summary: "One-stock conviction, timing, and risk framing.",
  },
  portfolio: {
    id: "portfolio",
    label: "Scan My Portfolio",
    summary: "Rank adds, trims, holds, and concentration risk.",
  },
  income: {
    id: "income",
    label: "Income / Options Ideas",
    summary: "Covered calls, CSPs, and PMCC fit checks.",
  },
  full: {
    id: "full",
    label: "Full PM Review",
    summary: "Portfolio, watchlist, deep-dives, and options overlay.",
  },
};

function withLlmFields(fields: FormFieldConfig[]) {
  return [...fields, ...LLM_FIELD_CONFIG];
}

export const FIELD_CONFIG: Record<AnalysisMode, FormFieldConfig[]> = {
  ticker: withLlmFields([
    { name: "ticker", label: "Ticker", type: "text", placeholder: "NVDA" },
    { name: "ownIt", label: "Do you own it?", type: "select", options: ["No", "Yes"] },
    { name: "shares", label: "Shares", type: "text", placeholder: "100" },
    { name: "avgCost", label: "Average cost", type: "text", placeholder: "118.50" },
    {
      name: "riskStyle",
      label: "Risk style",
      type: "select",
      options: ["Conservative", "Balanced", "Aggressive"],
    },
    {
      name: "timeHorizon",
      label: "Time horizon",
      type: "select",
      options: ["Swing", "Position", "Long-term"],
    },
    { name: "cash", label: "Cash available", type: "text", placeholder: "5000" },
    {
      name: "notes",
      label: "Notes or thesis context",
      type: "textarea",
      placeholder: "Worried about chasing after a strong run.",
    },
  ]),
  portfolio: withLlmFields([
    {
      name: "positions",
      label: "Portfolio positions",
      type: "textarea",
      placeholder: "AAPL, 100, 174.20\nAMD, 75, 162.50",
    },
    {
      name: "watchlist",
      label: "Watchlist",
      type: "textarea",
      placeholder: "AMZN\nMETA\nNFLX",
    },
    { name: "cash", label: "Cash available", type: "text", placeholder: "20000" },
    {
      name: "objective",
      label: "Objective",
      type: "select",
      options: ["Balanced", "Growth", "Income"],
    },
    {
      name: "riskStyle",
      label: "Risk style",
      type: "select",
      options: ["Conservative", "Balanced", "Aggressive"],
    },
    {
      name: "constraints",
      label: "Constraints and notes",
      type: "textarea",
      placeholder: "Max 10% per position. Prefer income overlays.",
    },
  ]),
  income: withLlmFields([
    { name: "ticker", label: "Ticker", type: "text", placeholder: "PLTR" },
    { name: "ownIt", label: "Do you own shares?", type: "select", options: ["No", "Yes"] },
    { name: "shares", label: "Shares owned", type: "text", placeholder: "100" },
    { name: "avgCost", label: "Average cost", type: "text", placeholder: "19.30" },
    { name: "cash", label: "Cash available", type: "text", placeholder: "3000" },
    {
      name: "incomeGoal",
      label: "Income goal",
      type: "select",
      options: ["Conservative weekly income", "Monthly yield", "Lower-cost bullish entry"],
    },
    {
      name: "riskStyle",
      label: "Risk style",
      type: "select",
      options: ["Conservative", "Balanced", "Aggressive"],
    },
    {
      name: "notes",
      label: "Notes",
      type: "textarea",
      placeholder: "Comfortable with assignment but do not want to cap too much upside.",
    },
  ]),
  full: withLlmFields([
    {
      name: "positions",
      label: "Portfolio positions",
      type: "textarea",
      placeholder: "AAPL, 100, 174.20\nAMD, 75, 162.50",
    },
    {
      name: "watchlist",
      label: "Watchlist",
      type: "textarea",
      placeholder: "AMZN\nMETA\nNFLX",
    },
    {
      name: "priorityTickers",
      label: "Priority tickers for deeper review",
      type: "text",
      placeholder: "AMD, NVDA",
    },
    { name: "cash", label: "Cash available", type: "text", placeholder: "20000" },
    {
      name: "objective",
      label: "Objective",
      type: "select",
      options: ["Balanced", "Growth", "Income"],
    },
    {
      name: "riskStyle",
      label: "Risk style",
      type: "select",
      options: ["Conservative", "Balanced", "Aggressive"],
    },
    {
      name: "notes",
      label: "Notes and concerns",
      type: "textarea",
      placeholder: "Need to reduce concentration and find better income overlays.",
    },
  ]),
};
