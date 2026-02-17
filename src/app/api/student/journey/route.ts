import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const discipline = request.nextUrl.searchParams.get("discipline") || "all";

    const student = await prisma.user.findFirst({
      where: { role: "student" },
      include: { skillProgress: true },
    });

    const skillMap = new Map(
      (student?.skillProgress ?? []).map((sp) => [sp.techniqueId, sp.level])
    );

    const milestones = await prisma.milestone.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        techniques: {
          include: {
            technique: {
              include: { position: true },
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
          position: { name: t.position.name },
          level: (skillMap.get(t.id) as string) ?? null,
        }));

      const stats = {
        total: techniques.length,
        exposed: techniques.filter((t) => t.level === "exposed").length,
        drilling: techniques.filter((t) => t.level === "drilling").length,
        sparring: techniques.filter((t) => t.level === "sparring").length,
        proficient: techniques.filter((t) => t.level === "proficient").length,
      };

      return {
        slug: m.slug,
        name: m.name,
        description: m.description || "",
        techniques,
        stats,
      };
    });

    return NextResponse.json({ milestones: result });
  } catch {
    return NextResponse.json({ milestones: [] });
  }
}
