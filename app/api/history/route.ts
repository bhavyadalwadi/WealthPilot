import { NextResponse } from "next/server";
import { listAnalysisHistory } from "@/db/queries";

export async function GET() {
  return NextResponse.json(await listAnalysisHistory());
}
