import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

interface GapEntry {
  positionSlug: string;
  categories: string[];
  notes?: string;
}

interface WeekPlan {
  week: number;
  theme: string;
  techniques: {
    id: string;
    name: string;
    slug: string;
    positionName: string;
    category: string;
  }[];
}

type TechniqueWithIncludes = Prisma.TechniqueGetPayload<{
  include: {
    position: true;
    classItems: {
      include: { classSession: { select: { date: true } } };
    };
  };
}>;

interface ScoredTechnique {
  technique: TechniqueWithIncludes;
  score: number;
}

/**
 * GET /api/coach/class-plan — Generate a 4-week class plan based on
 * recent competition gaps + coverage heatmap data.
 *
 * Prioritizes:
 * 1. Positions/categories from recent comp gaps (last 90 days)
 * 2. Techniques not taught recently (stale)
 * 3. Nogi discipline by default
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Load recent comp gaps (last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const recentGaps = await prisma.competitionGap.findMany({
      where: {
        coachId: userId,
        date: { gte: ninetyDaysAgo },
      },
      orderBy: { date: "desc" },
    });

    // Aggregate gap positions and categories with frequency
    const positionFrequency = new Map<string, number>();
    const positionCategories = new Map<string, Set<string>>();

    for (const gap of recentGaps) {
      const entries: GapEntry[] = JSON.parse(gap.gaps);
      for (const entry of entries) {
        positionFrequency.set(
          entry.positionSlug,
          (positionFrequency.get(entry.positionSlug) || 0) + 1
        );
        if (!positionCategories.has(entry.positionSlug)) {
          positionCategories.set(entry.positionSlug, new Set());
        }
        for (const cat of entry.categories) {
          positionCategories.get(entry.positionSlug)!.add(cat);
        }
      }
    }

    // 2. Load all nogi-compatible techniques with their class coverage
    const techniques = await prisma.technique.findMany({
      where: {
        OR: [{ discipline: "nogi" }, { discipline: "all" }],
      },
      include: {
        position: true,
        classItems: {
          include: { classSession: { select: { date: true } } },
          orderBy: { classSession: { date: "desc" } },
          take: 1,
        },
      },
    });

    // Score each technique: higher = more urgent to teach
    const scored = techniques.map((t: TechniqueWithIncludes) => {
      let score = 0;

      // Comp gap match: position was exposed
      const posFreq = positionFrequency.get(t.position.slug) || 0;
      if (posFreq > 0) {
        score += posFreq * 10;

        // Category match bonus
        const cats = positionCategories.get(t.position.slug);
        if (cats && cats.has(t.category)) {
          score += 15;
        }
      }

      // Staleness bonus: not taught recently
      if (t.classItems.length === 0) {
        score += 5; // never taught
      } else {
        const lastDate = t.classItems[0].classSession.date;
        const daysSince = Math.floor(
          (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSince > 30) score += 3;
        if (daysSince > 60) score += 3;
      }

      // Prefer fundamental/intermediate over advanced for class plans
      if (t.difficulty === "fundamental") score += 2;
      if (t.difficulty === "intermediate") score += 1;

      return { technique: t, score };
    });

    // Sort by score descending
    scored.sort((a: ScoredTechnique, b: ScoredTechnique) => b.score - a.score);

    // 3. Build 4-week plan
    // Group top techniques by position to create themed weeks
    const usedTechIds = new Set<string>();
    const weeks: WeekPlan[] = [];

    // Get ranked positions from comp gaps
    const rankedPositions = Array.from(positionFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([slug]) => slug);

    // If we have fewer than 4 gap positions, fill with positions that have
    // the highest scored techniques
    const allPositionScores = new Map<string, number>();
    for (const s of scored) {
      const posSlug = s.technique.position.slug;
      allPositionScores.set(
        posSlug,
        (allPositionScores.get(posSlug) || 0) + s.score
      );
    }

    const fillerPositions = Array.from(allPositionScores.entries())
      .filter(([slug]) => !rankedPositions.includes(slug))
      .sort((a, b) => b[1] - a[1])
      .map(([slug]) => slug);

    const weekPositions = [...rankedPositions, ...fillerPositions].slice(0, 4);

    // If we still have fewer than 4 positions (unlikely), pad
    while (weekPositions.length < 4) {
      weekPositions.push(weekPositions[0] || "standing");
    }

    for (let w = 0; w < 4; w++) {
      const targetPosition = weekPositions[w];

      // Find best techniques for this position
      const positionTechniques = scored
        .filter(
          (s: ScoredTechnique) =>
            s.technique.position.slug === targetPosition &&
            !usedTechIds.has(s.technique.id)
        )
        .slice(0, 4);

      // If fewer than 3, fill from related categories across other positions
      if (positionTechniques.length < 3) {
        const filler = scored
          .filter(
            (s: ScoredTechnique) =>
              !usedTechIds.has(s.technique.id) &&
              s.technique.position.slug !== targetPosition
          )
          .slice(0, 4 - positionTechniques.length);
        positionTechniques.push(...filler);
      }

      for (const pt of positionTechniques) {
        usedTechIds.add(pt.technique.id);
      }

      // Determine theme name
      const positionObj = positionTechniques[0]?.technique.position;
      const posName = positionObj?.name || targetPosition;

      // Build category descriptors for the theme
      const categoriesInWeek = [
        ...new Set(positionTechniques.map((pt: ScoredTechnique) => pt.technique.category)),
      ];
      const categoryLabels: Record<string, string> = {
        escape: "Escapes",
        defense: "Defense",
        sweep: "Sweeps",
        submission: "Submissions",
        pass: "Passes",
        takedown: "Takedowns",
        control: "Control",
        transition: "Transitions",
        throw: "Throws",
      };
      const catNames = categoriesInWeek
        .map((c: string) => categoryLabels[c] || c)
        .slice(0, 2);

      weeks.push({
        week: w + 1,
        theme: `${posName}: ${catNames.join(" & ")}`,
        techniques: positionTechniques.map((pt: ScoredTechnique) => ({
          id: pt.technique.id,
          name: pt.technique.name,
          slug: pt.technique.slug,
          positionName: pt.technique.position.name,
          category: pt.technique.category,
        })),
      });
    }

    return NextResponse.json({
      weeks,
      basedOnGaps: recentGaps.length,
      gapPositions: rankedPositions,
    });
  } catch (error) {
    console.error("Class plan error:", error);
    return NextResponse.json(
      { error: "Failed to generate class plan" },
      { status: 500 }
    );
  }
}
