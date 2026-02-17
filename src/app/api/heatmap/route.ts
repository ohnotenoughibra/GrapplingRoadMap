import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const discipline = request.nextUrl.searchParams.get("discipline") || "all";

    const positions = await prisma.position.findMany({
      orderBy: { sortOrder: "asc" },
    });

    const classTechniques = await prisma.classTechnique.findMany({
      include: {
        technique: {
          include: { position: true },
        },
        classSession: true,
      },
    });

    const filtered = classTechniques.filter((ct) => {
      if (discipline === "all") return true;
      return (
        ct.classSession.discipline === discipline ||
        ct.technique.discipline === "all"
      );
    });

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
  } catch {
    return NextResponse.json({ positions: [], heatmap: {}, maxCount: 0 });
  }
}
