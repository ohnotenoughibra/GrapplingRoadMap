import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const discipline = request.nextUrl.searchParams.get("discipline") || "all";

    const milestones = await prisma.milestone.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        techniques: {
          include: {
            technique: {
              include: {
                position: true,
                classItems: true,
              },
            },
          },
        },
      },
    });

    const result = milestones.map((m) => {
      const techniques = m.techniques
        .map((mt) => mt.technique)
        .filter((t) => {
          if (discipline === "all") return true;
          return t.discipline === discipline || t.discipline === "all";
        })
        .map((t) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          discipline: t.discipline,
          category: t.category,
          difficulty: t.difficulty,
          position: { name: t.position.name },
          taughtCount: t.classItems.length,
        }));

      return {
        slug: m.slug,
        name: m.name,
        description: m.description || "",
        techniques,
      };
    });

    return NextResponse.json({ milestones: result });
  } catch {
    return NextResponse.json({ milestones: [] });
  }
}
