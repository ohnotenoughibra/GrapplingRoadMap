import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [techniques, positions] = await Promise.all([
      prisma.technique.findMany({
        include: { position: true },
        orderBy: [{ position: { sortOrder: "asc" } }, { sortOrder: "asc" }],
      }),
      prisma.position.findMany({
        orderBy: { sortOrder: "asc" },
      }),
    ]);

    return NextResponse.json({ techniques, positions });
  } catch {
    return NextResponse.json({ techniques: [], positions: [] });
  }
}
