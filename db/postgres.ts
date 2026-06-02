import { Pool } from "pg";
import type { AnalysisHistoryEntry, SavedPortfolio, UserProfile } from "@/lib/schemas/persistence";

const globalForPg = globalThis as unknown as {
  wealthpilotPgPool?: Pool;
  wealthpilotPgReady?: Promise<void>;
};

function getPool() {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("Missing DATABASE_URL for Postgres storage.");
  }

  if (!globalForPg.wealthpilotPgPool) {
    globalForPg.wealthpilotPgPool = new Pool({
      connectionString,
      ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false },
    });
  }

  return globalForPg.wealthpilotPgPool;
}

async function ensureSchema() {
  if (!globalForPg.wealthpilotPgReady) {
    globalForPg.wealthpilotPgReady = (async () => {
      const pool = getPool();
      await pool.query(`
        CREATE TABLE IF NOT EXISTS user_profiles (
          id TEXT PRIMARY KEY,
          default_risk_style TEXT NOT NULL,
          default_objective TEXT NOT NULL,
          default_time_horizon TEXT NOT NULL,
          default_llm_provider TEXT NOT NULL,
          default_llm_model TEXT NOT NULL,
          default_llm_reasoning TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS saved_portfolios (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          positions_json JSONB NOT NULL,
          watchlist_json JSONB NOT NULL,
          cash DOUBLE PRECISION NOT NULL,
          objective TEXT NOT NULL,
          risk_style TEXT NOT NULL,
          notes TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS analysis_history_entries (
          id TEXT PRIMARY KEY,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          mode TEXT NOT NULL,
          intent TEXT NOT NULL,
          focus_label TEXT NOT NULL,
          action TEXT NOT NULL,
          confidence TEXT NOT NULL,
          summary TEXT NOT NULL,
          llm_provider TEXT NOT NULL,
          llm_model TEXT NOT NULL
        );
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS saved_portfolios_updated_at_idx
        ON saved_portfolios (updated_at DESC);
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS analysis_history_entries_created_at_idx
        ON analysis_history_entries (created_at DESC);
      `);
    })();
  }

  await globalForPg.wealthpilotPgReady;
}

export async function getPostgresUserProfile(): Promise<UserProfile | null> {
  await ensureSchema();
  const result = await getPool().query(`SELECT * FROM user_profiles WHERE id = $1 LIMIT 1`, ["default"]);
  const row = result.rows[0];
  if (!row) return null;

  return {
    id: "default",
    defaultRiskStyle: row.default_risk_style,
    defaultObjective: row.default_objective,
    defaultTimeHorizon: row.default_time_horizon,
    defaultLlmProvider: row.default_llm_provider,
    defaultLlmModel: row.default_llm_model,
    defaultLlmReasoning: row.default_llm_reasoning,
    updatedAt: new Date(row.updated_at).toISOString(),
  } as UserProfile;
}

export async function savePostgresUserProfile(profile: UserProfile) {
  await ensureSchema();
  await getPool().query(
    `
      INSERT INTO user_profiles (
        id, default_risk_style, default_objective, default_time_horizon,
        default_llm_provider, default_llm_model, default_llm_reasoning, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())
      ON CONFLICT (id) DO UPDATE SET
        default_risk_style = EXCLUDED.default_risk_style,
        default_objective = EXCLUDED.default_objective,
        default_time_horizon = EXCLUDED.default_time_horizon,
        default_llm_provider = EXCLUDED.default_llm_provider,
        default_llm_model = EXCLUDED.default_llm_model,
        default_llm_reasoning = EXCLUDED.default_llm_reasoning,
        updated_at = NOW()
    `,
    [
      profile.id,
      profile.defaultRiskStyle,
      profile.defaultObjective,
      profile.defaultTimeHorizon,
      profile.defaultLlmProvider,
      profile.defaultLlmModel,
      profile.defaultLlmReasoning,
    ],
  );
}

export async function listPostgresPortfolios(): Promise<SavedPortfolio[]> {
  await ensureSchema();
  const result = await getPool().query(`SELECT * FROM saved_portfolios ORDER BY updated_at DESC`);
  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    positions: row.positions_json,
    watchlist: row.watchlist_json,
    cash: row.cash,
    objective: row.objective,
    riskStyle: row.risk_style,
    notes: row.notes,
    updatedAt: new Date(row.updated_at).toISOString(),
  })) as SavedPortfolio[];
}

export async function savePostgresPortfolio(portfolio: SavedPortfolio) {
  await ensureSchema();
  await getPool().query(
    `
      INSERT INTO saved_portfolios (
        id, name, positions_json, watchlist_json, cash, objective, risk_style, notes, updated_at
      ) VALUES ($1,$2,$3::jsonb,$4::jsonb,$5,$6,$7,$8,NOW())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        positions_json = EXCLUDED.positions_json,
        watchlist_json = EXCLUDED.watchlist_json,
        cash = EXCLUDED.cash,
        objective = EXCLUDED.objective,
        risk_style = EXCLUDED.risk_style,
        notes = EXCLUDED.notes,
        updated_at = NOW()
    `,
    [
      portfolio.id,
      portfolio.name,
      JSON.stringify(portfolio.positions),
      JSON.stringify(portfolio.watchlist),
      portfolio.cash,
      portfolio.objective,
      portfolio.riskStyle,
      portfolio.notes,
    ],
  );
}

export async function deletePostgresPortfolio(id: string) {
  await ensureSchema();
  const result = await getPool().query(`DELETE FROM saved_portfolios WHERE id = $1`, [id]);
  return (result.rowCount ?? 0) > 0;
}

export async function listPostgresHistory(limit: number): Promise<AnalysisHistoryEntry[]> {
  await ensureSchema();
  const result = await getPool().query(
    `SELECT * FROM analysis_history_entries ORDER BY created_at DESC LIMIT $1`,
    [limit],
  );
  return result.rows.map((row) => ({
    id: row.id,
    createdAt: new Date(row.created_at).toISOString(),
    mode: row.mode,
    intent: row.intent,
    focusLabel: row.focus_label,
    action: row.action,
    confidence: row.confidence,
    summary: row.summary,
    llmProvider: row.llm_provider,
    llmModel: row.llm_model,
  })) as AnalysisHistoryEntry[];
}

export async function appendPostgresHistory(entry: AnalysisHistoryEntry) {
  await ensureSchema();
  const pool = getPool();
  await pool.query(
    `
      INSERT INTO analysis_history_entries (
        id, created_at, mode, intent, focus_label, action, confidence, summary, llm_provider, llm_model
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    `,
    [
      entry.id,
      entry.createdAt,
      entry.mode,
      entry.intent,
      entry.focusLabel,
      entry.action,
      entry.confidence,
      entry.summary,
      entry.llmProvider,
      entry.llmModel,
    ],
  );

  await pool.query(`
    DELETE FROM analysis_history_entries
    WHERE id IN (
      SELECT id FROM analysis_history_entries
      ORDER BY created_at DESC
      OFFSET 50
    )
  `);
}
