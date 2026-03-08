import { POSITIONS, TECHNIQUES } from "@/lib/data/taxonomy";
import { buildGraphData } from "@/lib/graph-builder";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const discipline = searchParams.get("discipline") || undefined;
  const data = buildGraphData(POSITIONS, TECHNIQUES, { discipline });
  return NextResponse.json(data);
}
