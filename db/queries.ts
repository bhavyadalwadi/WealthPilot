import { randomUUID } from "node:crypto";
import { DEFAULT_LLM_MODEL, DEFAULT_LLM_PROVIDER, DEFAULT_LLM_REASONING } from "@/lib/config/llm";
import type { Objective, PortfolioPosition, RiskStyle } from "@/lib/schemas/analysis";
import type { AnalysisHistoryEntry, SavedPortfolio, UserProfile } from "@/lib/schemas/persistence";
import { readJsonFile, writeJsonFile } from "@/db/store";

const profileFile = "profile.json";
const portfoliosFile = "portfolios.json";
const historyFile = "history.json";

export async function getUserProfile(): Promise<UserProfile> {
  return readJsonFile<UserProfile>(profileFile, {
    id: "default",
    defaultRiskStyle: "Balanced",
    defaultObjective: "Balanced",
    defaultTimeHorizon: "Position",
    defaultLlmProvider: DEFAULT_LLM_PROVIDER,
    defaultLlmModel: DEFAULT_LLM_MODEL,
    defaultLlmReasoning: DEFAULT_LLM_REASONING,
    updatedAt: new Date(0).toISOString(),
  });
}

export async function saveUserProfile(profile: Omit<UserProfile, "id" | "updatedAt">) {
  const nextProfile: UserProfile = {
    id: "default",
    ...profile,
    updatedAt: new Date().toISOString(),
  };
  await writeJsonFile(profileFile, nextProfile);
  return nextProfile;
}

export async function listSavedPortfolios(): Promise<SavedPortfolio[]> {
  return readJsonFile<SavedPortfolio[]>(portfoliosFile, []);
}

export async function getSavedPortfolio(id: string) {
  const portfolios = await listSavedPortfolios();
  return portfolios.find((portfolio) => portfolio.id === id) ?? null;
}

export async function upsertSavedPortfolio(input: {
  id?: string;
  name: string;
  positions: PortfolioPosition[];
  watchlist: string[];
  cash: number;
  objective: Objective;
  riskStyle: RiskStyle;
  notes: string;
}) {
  const portfolios = await listSavedPortfolios();
  const id = input.id || slugify(input.name) || randomUUID();
  const nextPortfolio: SavedPortfolio = {
    id,
    ...input,
    updatedAt: new Date().toISOString(),
  };

  const next = portfolios.filter((portfolio) => portfolio.id !== id);
  next.unshift(nextPortfolio);
  await writeJsonFile(portfoliosFile, next);
  return nextPortfolio;
}

export async function deleteSavedPortfolio(id: string) {
  const portfolios = await listSavedPortfolios();
  const next = portfolios.filter((portfolio) => portfolio.id !== id);
  await writeJsonFile(portfoliosFile, next);
  return next.length !== portfolios.length;
}

export async function listAnalysisHistory(limit = 12): Promise<AnalysisHistoryEntry[]> {
  const history = await readJsonFile<AnalysisHistoryEntry[]>(historyFile, []);
  return history.slice(0, limit);
}

export async function appendAnalysisHistory(entry: Omit<AnalysisHistoryEntry, "id" | "createdAt">) {
  const history = await readJsonFile<AnalysisHistoryEntry[]>(historyFile, []);
  const nextEntry: AnalysisHistoryEntry = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...entry,
  };
  await writeJsonFile(historyFile, [nextEntry, ...history].slice(0, 50));
  return nextEntry;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
