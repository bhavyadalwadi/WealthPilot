import { randomUUID } from "node:crypto";
import { DEFAULT_LLM_MODEL, DEFAULT_LLM_PROVIDER, DEFAULT_LLM_REASONING } from "@/lib/config/llm";
import type { Objective, PortfolioPosition, RiskStyle } from "@/lib/schemas/analysis";
import type { AnalysisHistoryEntry, SavedPortfolio, UserProfile } from "@/lib/schemas/persistence";
import { getStorageBackend } from "@/db/store";
import {
  appendPostgresHistory,
  deletePostgresPortfolio,
  getPostgresUserProfile,
  listPostgresHistory,
  listPostgresPortfolios,
  savePostgresPortfolio,
  savePostgresUserProfile,
} from "@/db/postgres";
import { getPrisma } from "@/lib/prisma";

const defaultProfile: UserProfile = {
  id: "default",
  defaultRiskStyle: "Balanced",
  defaultObjective: "Balanced",
  defaultTimeHorizon: "Position",
  defaultLlmProvider: DEFAULT_LLM_PROVIDER,
  defaultLlmModel: DEFAULT_LLM_MODEL,
  defaultLlmReasoning: DEFAULT_LLM_REASONING,
  updatedAt: new Date(0).toISOString(),
};

export async function getUserProfile(): Promise<UserProfile> {
  if (getStorageBackend() === "postgres") {
    return (await getPostgresUserProfile()) ?? defaultProfile;
  }

  const prisma = getPrisma();
  const profile = await prisma.userProfile.findUnique({
    where: { id: "default" },
  });

  if (!profile) return defaultProfile;

  return {
    id: "default",
    defaultRiskStyle: profile.defaultRiskStyle as UserProfile["defaultRiskStyle"],
    defaultObjective: profile.defaultObjective as UserProfile["defaultObjective"],
    defaultTimeHorizon: profile.defaultTimeHorizon as UserProfile["defaultTimeHorizon"],
    defaultLlmProvider: profile.defaultLlmProvider as UserProfile["defaultLlmProvider"],
    defaultLlmModel: profile.defaultLlmModel,
    defaultLlmReasoning: profile.defaultLlmReasoning as UserProfile["defaultLlmReasoning"],
    updatedAt: profile.updatedAt.toISOString(),
  };
}

export async function saveUserProfile(profile: Omit<UserProfile, "id" | "updatedAt">) {
  const nextProfile: UserProfile = {
    id: "default",
    ...profile,
    updatedAt: new Date().toISOString(),
  };

  if (getStorageBackend() === "postgres") {
    await savePostgresUserProfile(nextProfile);
    return nextProfile;
  }

  const prisma = getPrisma();
  await prisma.userProfile.upsert({
    where: { id: "default" },
    update: {
      defaultRiskStyle: nextProfile.defaultRiskStyle,
      defaultObjective: nextProfile.defaultObjective,
      defaultTimeHorizon: nextProfile.defaultTimeHorizon,
      defaultLlmProvider: nextProfile.defaultLlmProvider,
      defaultLlmModel: nextProfile.defaultLlmModel,
      defaultLlmReasoning: nextProfile.defaultLlmReasoning,
    },
    create: {
      id: "default",
      defaultRiskStyle: nextProfile.defaultRiskStyle,
      defaultObjective: nextProfile.defaultObjective,
      defaultTimeHorizon: nextProfile.defaultTimeHorizon,
      defaultLlmProvider: nextProfile.defaultLlmProvider,
      defaultLlmModel: nextProfile.defaultLlmModel,
      defaultLlmReasoning: nextProfile.defaultLlmReasoning,
    },
  });

  return nextProfile;
}

export async function listSavedPortfolios(): Promise<SavedPortfolio[]> {
  if (getStorageBackend() === "postgres") {
    return listPostgresPortfolios();
  }

  const prisma = getPrisma();
  const portfolios = await prisma.savedPortfolio.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return portfolios.map((portfolio) => ({
    id: portfolio.id,
    name: portfolio.name,
    positions: parseJson<PortfolioPosition[]>(portfolio.positionsJson, []),
    watchlist: parseJson<string[]>(portfolio.watchlistJson, []),
    cash: portfolio.cash,
    objective: portfolio.objective as SavedPortfolio["objective"],
    riskStyle: portfolio.riskStyle as SavedPortfolio["riskStyle"],
    notes: portfolio.notes,
    updatedAt: portfolio.updatedAt.toISOString(),
  }));
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
  const id = input.id || slugify(input.name) || randomUUID();
  const nextPortfolio: SavedPortfolio = {
    id,
    ...input,
    updatedAt: new Date().toISOString(),
  };

  if (getStorageBackend() === "postgres") {
    await savePostgresPortfolio(nextPortfolio);
    return nextPortfolio;
  }

  const prisma = getPrisma();
  await prisma.savedPortfolio.upsert({
    where: { id },
    update: {
      name: nextPortfolio.name,
      positionsJson: JSON.stringify(nextPortfolio.positions),
      watchlistJson: JSON.stringify(nextPortfolio.watchlist),
      cash: nextPortfolio.cash,
      objective: nextPortfolio.objective,
      riskStyle: nextPortfolio.riskStyle,
      notes: nextPortfolio.notes,
    },
    create: {
      id,
      name: nextPortfolio.name,
      positionsJson: JSON.stringify(nextPortfolio.positions),
      watchlistJson: JSON.stringify(nextPortfolio.watchlist),
      cash: nextPortfolio.cash,
      objective: nextPortfolio.objective,
      riskStyle: nextPortfolio.riskStyle,
      notes: nextPortfolio.notes,
    },
  });

  return nextPortfolio;
}

export async function deleteSavedPortfolio(id: string) {
  if (getStorageBackend() === "postgres") {
    return deletePostgresPortfolio(id);
  }

  const prisma = getPrisma();
  const deleted = await prisma.savedPortfolio.deleteMany({
    where: { id },
  });

  return deleted.count > 0;
}

export async function listAnalysisHistory(limit = 12): Promise<AnalysisHistoryEntry[]> {
  if (getStorageBackend() === "postgres") {
    return listPostgresHistory(limit);
  }

  const prisma = getPrisma();
  const history = await prisma.analysisHistoryEntry.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return history.map((entry) => ({
    id: entry.id,
    createdAt: entry.createdAt.toISOString(),
    mode: entry.mode as AnalysisHistoryEntry["mode"],
    intent: entry.intent as AnalysisHistoryEntry["intent"],
    focusLabel: entry.focusLabel,
    action: entry.action,
    confidence: entry.confidence as AnalysisHistoryEntry["confidence"],
    summary: entry.summary,
    llmProvider: entry.llmProvider as AnalysisHistoryEntry["llmProvider"],
    llmModel: entry.llmModel,
  }));
}

export async function appendAnalysisHistory(entry: Omit<AnalysisHistoryEntry, "id" | "createdAt">) {
  const nextEntry: AnalysisHistoryEntry = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...entry,
  };

  if (getStorageBackend() === "postgres") {
    await appendPostgresHistory(nextEntry);
    return nextEntry;
  }

  const prisma = getPrisma();
  await prisma.analysisHistoryEntry.create({
    data: {
      id: nextEntry.id,
      createdAt: new Date(nextEntry.createdAt),
      mode: nextEntry.mode,
      intent: nextEntry.intent,
      focusLabel: nextEntry.focusLabel,
      action: nextEntry.action,
      confidence: nextEntry.confidence,
      summary: nextEntry.summary,
      llmProvider: nextEntry.llmProvider,
      llmModel: nextEntry.llmModel,
    },
  });

  const total = await prisma.analysisHistoryEntry.count();
  if (total > 50) {
    const stale = await prisma.analysisHistoryEntry.findMany({
      orderBy: { createdAt: "desc" },
      skip: 50,
      select: { id: true },
    });

    if (stale.length) {
      await prisma.analysisHistoryEntry.deleteMany({
        where: { id: { in: stale.map((item) => item.id) } },
      });
    }
  }

  return nextEntry;
}

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
