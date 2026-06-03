import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { getPrisma } from "@/lib/prisma";
import type { AnalysisHistoryEntry, SavedPortfolio, UserProfile } from "@/lib/schemas/persistence";

const globalForMigration = globalThis as unknown as {
  wealthpilotLegacyMigration?: Promise<void>;
};

const storageDir = path.join(process.cwd(), "db", "storage");

export async function ensureLegacyJsonMigration() {
  if (!globalForMigration.wealthpilotLegacyMigration) {
    globalForMigration.wealthpilotLegacyMigration = migrateLegacyJsonIfNeeded();
  }

  await globalForMigration.wealthpilotLegacyMigration;
}

async function migrateLegacyJsonIfNeeded() {
  if (!(await hasLegacyStorageDir())) {
    return;
  }

  const prisma = getPrisma();
  const [profileCount, portfolioCount, historyCount] = await Promise.all([
    prisma.userProfile.count(),
    prisma.savedPortfolio.count(),
    prisma.analysisHistoryEntry.count(),
  ]);

  const [legacyProfile, legacyPortfolios, legacyHistory] = await Promise.all([
    readLegacyJson<UserProfile>("profile.json"),
    readLegacyJson<SavedPortfolio[]>("portfolios.json"),
    readLegacyJson<AnalysisHistoryEntry[]>("history.json"),
  ]);

  if (profileCount === 0 && legacyProfile) {
    await prisma.userProfile.create({
      data: {
        id: "default",
        defaultRiskStyle: legacyProfile.defaultRiskStyle,
        defaultObjective: legacyProfile.defaultObjective,
        defaultTimeHorizon: legacyProfile.defaultTimeHorizon,
        defaultLlmProvider: legacyProfile.defaultLlmProvider,
        defaultLlmModel: legacyProfile.defaultLlmModel,
        defaultLlmReasoning: legacyProfile.defaultLlmReasoning,
        updatedAt: new Date(legacyProfile.updatedAt),
      },
    });
  }

  if (portfolioCount === 0 && legacyPortfolios?.length) {
    await prisma.savedPortfolio.createMany({
      data: legacyPortfolios.map((portfolio) => ({
        id: portfolio.id,
        name: portfolio.name,
        positionsJson: JSON.stringify(portfolio.positions),
        watchlistJson: JSON.stringify(portfolio.watchlist),
        cash: portfolio.cash,
        objective: portfolio.objective,
        riskStyle: portfolio.riskStyle,
        notes: portfolio.notes,
        updatedAt: new Date(portfolio.updatedAt),
      })),
    });
  }

  if (historyCount === 0 && legacyHistory?.length) {
    await prisma.analysisHistoryEntry.createMany({
      data: legacyHistory.map((entry) => ({
        id: entry.id,
        createdAt: new Date(entry.createdAt),
        mode: entry.mode,
        intent: entry.intent,
        focusLabel: entry.focusLabel,
        action: entry.action,
        confidence: entry.confidence,
        summary: entry.summary,
        llmProvider: entry.llmProvider,
        llmModel: entry.llmModel,
      })),
    });
  }
}

async function hasLegacyStorageDir() {
  try {
    await access(storageDir);
    return true;
  } catch {
    return false;
  }
}

async function readLegacyJson<T>(filename: string): Promise<T | null> {
  try {
    const raw = await readFile(path.join(storageDir, filename), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
