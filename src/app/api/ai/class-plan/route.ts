import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { discipline, focus, difficulty } = await request.json();

    if (!discipline) {
      return NextResponse.json({ error: "discipline required" }, { status: 400 });
    }

    // Get all techniques for the discipline
    const techniques = await prisma.technique.findMany({
      where: {
        OR: [{ discipline }, { discipline: "all" }],
        ...(difficulty ? { difficulty } : {}),
      },
      include: {
        position: true,
        classItems: { include: { classSession: true } },
      },
    });

    // Get student weak spots
    const studentSkills = await prisma.studentSkill.findMany({
      where: { level: { in: ["exposed", "drilling"] } },
    });

    const weakTechIds = new Set(studentSkills.map((s) => s.techniqueId));

    // Score techniques: prioritize undertaught + student weak spots
    const scored = techniques.map((t) => {
      let score = 0;

      // Never taught = high priority
      if (t.classItems.length === 0) score += 10;

      // Not taught recently
      if (t.classItems.length > 0) {
        const lastTaught = t.classItems
          .map((ci) => ci.classSession.date)
          .sort((a, b) => b.getTime() - a.getTime())[0];
        const daysSince = Math.floor((Date.now() - lastTaught.getTime()) / (1000 * 60 * 60 * 24));
        score += Math.min(daysSince / 7, 5); // up to 5 points for staleness
      }

      // Student weak spot
      if (weakTechIds.has(t.id)) score += 3;

      // Focus area match
      if (focus && t.category === focus) score += 5;
      if (focus && t.position.slug === focus) score += 5;

      return { ...t, score };
    });

    // Sort by score, pick top techniques
    scored.sort((a, b) => b.score - a.score);

    // Build a class plan: pick 4-6 related techniques
    const selected = scored.slice(0, 6);

    // Group by position to create a coherent flow
    const positionGroups = new Map<string, typeof selected>();
    for (const t of selected) {
      const pos = t.position.name;
      if (!positionGroups.has(pos)) positionGroups.set(pos, []);
      positionGroups.get(pos)!.push(t);
    }

    // Build class plan
    const plan = {
      discipline,
      suggestedTitle: `${discipline.charAt(0).toUpperCase() + discipline.slice(1)} \u2014 ${selected[0]?.position.name || "Mixed"} Focus`,
      techniques: selected.map((t) => ({
        id: t.id,
        name: t.name,
        position: t.position.name,
        category: t.category,
        difficulty: t.difficulty,
        reason: t.classItems.length === 0 ? "Never taught" :
          weakTechIds.has(t.id) ? "Student weak spot" : "Due for review",
      })),
      warmupSuggestion: discipline === "wrestling"
        ? "Sprawl drills, level change practice, pummeling"
        : discipline === "gi"
          ? "Guard pull entries, grip fighting, hip escapes"
          : "Pummeling, arm drags, wrestling up drills",
      focusAreas: Array.from(positionGroups.keys()),
    };

    return NextResponse.json(plan);
  } catch {
    return NextResponse.json({ error: "Failed to generate plan" }, { status: 500 });
  }
}
