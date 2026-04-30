import { NextResponse } from "next/server";
import { deleteSavedPortfolio, getSavedPortfolio } from "@/db/queries";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const portfolio = await getSavedPortfolio(id);

  if (!portfolio) {
    return NextResponse.json({ error: "Portfolio not found." }, { status: 404 });
  }

  return NextResponse.json(portfolio);
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const deleted = await deleteSavedPortfolio(id);

  if (!deleted) {
    return NextResponse.json({ error: "Portfolio not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
