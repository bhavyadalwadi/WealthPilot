import { NextResponse } from "next/server";
import { listSavedPortfolios, upsertSavedPortfolio } from "@/db/queries";
import type { Objective, PortfolioPosition, RiskStyle } from "@/lib/schemas/analysis";

export async function GET() {
  return NextResponse.json(await listSavedPortfolios());
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    id?: string;
    name: string;
    positions: PortfolioPosition[];
    watchlist: string[];
    cash: number;
    objective: Objective;
    riskStyle: RiskStyle;
    notes: string;
  };

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Portfolio name is required." }, { status: 400 });
  }

  const portfolio = await upsertSavedPortfolio({
    id: body.id,
    name: body.name.trim(),
    positions: body.positions || [],
    watchlist: body.watchlist || [],
    cash: body.cash || 0,
    objective: body.objective || "Balanced",
    riskStyle: body.riskStyle || "Balanced",
    notes: body.notes || "",
  });

  return NextResponse.json(portfolio);
}
