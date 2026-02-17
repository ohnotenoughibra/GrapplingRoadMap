import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const discipline = request.nextUrl.searchParams.get("discipline") || "all";

    // Get all techniques
    const techniques = await prisma.technique.findMany({
      where: discipline !== "all" ? { OR: [{ discipline }, { discipline: "all" }] } : {},
      include: { position: true, classItems: { include: { classSession: true } } },
    });

    // Find techniques never taught
    const neverTaught = techniques
      .filter((t) => t.classItems.length === 0)
      .map((t) => ({ id: t.id, name: t.name, position: t.position.name, category: t.category, discipline: t.discipline }));

    // Find techniques not taught in 30+ days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stale = techniques
      .filter((t) => {
        if (t.classItems.length === 0) return false;
        const lastTaught = t.classItems
          .map((ci) => ci.classSession.date)
          .sort((a, b) => b.getTime() - a.getTime())[0];
        return lastTaught < thirtyDaysAgo;
      })
      .map((t) => {
        const lastTaught = t.classItems
          .map((ci) => ci.classSession.date)
          .sort((a, b) => b.getTime() - a.getTime())[0];
        return {
          id: t.id,
          name: t.name,
          position: t.position.name,
          category: t.category,
          discipline: t.discipline,
          lastTaught: lastTaught.toISOString(),
          daysSince: Math.floor((Date.now() - lastTaught.getTime()) / (1000 * 60 * 60 * 24)),
        };
      })
      .sort((a, b) => b.daysSince - a.daysSince);

    // Student weak spots: techniques where most students are below "sparring"
    const studentSkills = await prisma.studentSkill.findMany({
      include: { technique: { include: { position: true } } },
    });

    const techSkillMap = new Map<string, { total: number; lowLevel: number; name: string; position: string }>();
    for (const sk of studentSkills) {
      const key = sk.techniqueId;
      const entry = techSkillMap.get(key) || { total: 0, lowLevel: 0, name: sk.technique.name, position: sk.technique.position.name };
      entry.total++;
      if (sk.level === "exposed" || sk.level === "drilling") entry.lowLevel++;
      techSkillMap.set(key, entry);
    }

    const weakSpots = Array.from(techSkillMap.entries())
      .filter(([, v]) => v.total >= 2 && v.lowLevel / v.total >= 0.6)
      .map(([id, v]) => ({ id, name: v.name, position: v.position, struggleRate: Math.round((v.lowLevel / v.total) * 100) }))
      .sort((a, b) => b.struggleRate - a.struggleRate)
      .slice(0, 15);

    // Position coverage summary
    const positionCoverage = new Map<string, { total: number; taught: number }>();
    for (const t of techniques) {
      const pos = t.position.name;
      const entry = positionCoverage.get(pos) || { total: 0, taught: 0 };
      entry.total++;
      if (t.classItems.length > 0) entry.taught++;
      positionCoverage.set(pos, entry);
    }

    const coverage = Array.from(positionCoverage.entries())
      .map(([position, v]) => ({ position, total: v.total, taught: v.taught, percent: Math.round((v.taught / v.total) * 100) }))
      .sort((a, b) => a.percent - b.percent);

    return NextResponse.json({
      neverTaught: neverTaught.slice(0, 20),
      stale: stale.slice(0, 20),
      weakSpots,
      coverage,
      summary: {
        totalTechniques: techniques.length,
        neverTaughtCount: neverTaught.length,
        staleCount: stale.length,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: "Failed to analyze gaps" }, { status: 500 });
  }
}
