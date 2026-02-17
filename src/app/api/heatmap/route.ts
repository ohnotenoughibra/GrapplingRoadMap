import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  const discipline = request.nextUrl.searchParams.get("discipline") || "all";

  const positions = await prisma.position.findMany({
    orderBy: { sortOrder: "asc" },
  });

  // Get all class techniques with their technique details
  const classTechniques = await prisma.classTechnique.findMany({
    include: {
      technique: {
        include: { position: true },
      },
      classSession: true,
    },
  });

  // Filter by discipline
  const filtered = classTechniques.filter((ct) => {
    if (discipline === "all") return true;
    return (
      ct.classSession.discipline === discipline ||
      ct.technique.discipline === "all"
    );
  });

  // Build heatmap: position slug -> category -> { count, technique names }
  const heatmap: Record<
    string,
    Record<string, { count: number; techniques: string[] }>
  > = {};
  let maxCount = 0;

  for (const ct of filtered) {
    const posSlug = ct.technique.position.slug;
    const category = ct.technique.category;

    if (!heatmap[posSlug]) heatmap[posSlug] = {};
    if (!heatmap[posSlug][category]) {
      heatmap[posSlug][category] = { count: 0, techniques: [] };
    }

    heatmap[posSlug][category].count++;
    const name = ct.technique.name;
    if (!heatmap[posSlug][category].techniques.includes(name)) {
      heatmap[posSlug][category].techniques.push(name);
    }

    if (heatmap[posSlug][category].count > maxCount) {
      maxCount = heatmap[posSlug][category].count;
    }
  }

  return NextResponse.json({ positions, heatmap, maxCount });
}
