import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    let userId: string;

    if (user) {
      userId = user.id;
    } else {
      const student = await prisma.user.findFirst({ where: { role: "student" } });
      if (!student) return NextResponse.json({ recommendations: [] });
      userId = student.id;
    }

    const student = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        skillProgress: { include: { technique: { include: { position: true } } } },
        attendances: {
          include: { classSession: { include: { techniques: { include: { technique: true } } } } },
          orderBy: { classSession: { date: "desc" } },
          take: 10,
        },
      },
    });

    if (!student) return NextResponse.json({ recommendations: [] });

    // Find current milestone
    const milestones = await prisma.milestone.findMany({
      orderBy: { sortOrder: "asc" },
      include: { techniques: { include: { technique: { include: { position: true } } } } },
    });

    const proficientIds = new Set(
      student.skillProgress.filter((s) => s.level === "proficient").map((s) => s.techniqueId)
    );

    // Find the first incomplete milestone
    let currentMilestone = milestones[0];
    for (const ms of milestones) {
      const completed = ms.techniques.every((t) => proficientIds.has(t.techniqueId));
      if (!completed) {
        currentMilestone = ms;
        break;
      }
    }

    const recommendations: Array<{ type: string; title: string; description: string; techniques?: Array<{ name: string; position: string }> }> = [];

    // 1. Milestone gap techniques - what to work on to complete current milestone
    const milestoneGaps = currentMilestone.techniques
      .filter((mt) => !proficientIds.has(mt.techniqueId))
      .map((mt) => mt.technique);

    if (milestoneGaps.length > 0) {
      const drillingOrSparring = milestoneGaps.filter((t) => {
        const skill = student.skillProgress.find((s) => s.techniqueId === t.id);
        return skill && (skill.level === "drilling" || skill.level === "sparring");
      });

      if (drillingOrSparring.length > 0) {
        recommendations.push({
          type: "milestone_close",
          title: "Almost there \u2014 push these to proficient",
          description: `These ${currentMilestone.name} techniques are close. Focus on them in sparring this week.`,
          techniques: drillingOrSparring.slice(0, 5).map((t) => ({ name: t.name, position: t.position.name })),
        });
      }

      const notStarted = milestoneGaps.filter((t) => {
        const skill = student.skillProgress.find((s) => s.techniqueId === t.id);
        return !skill;
      });

      if (notStarted.length > 0) {
        recommendations.push({
          type: "milestone_new",
          title: "New techniques to explore",
          description: `You haven't started these ${currentMilestone.name} techniques yet.`,
          techniques: notStarted.slice(0, 5).map((t) => ({ name: t.name, position: t.position.name })),
        });
      }
    }

    // 2. Position weakness \u2014 find positions with the least proficient techniques
    const positionSkills = new Map<string, { total: number; proficient: number; name: string }>();
    for (const sp of student.skillProgress) {
      const pos = sp.technique.position.name;
      const entry = positionSkills.get(pos) || { total: 0, proficient: 0, name: pos };
      entry.total++;
      if (sp.level === "proficient") entry.proficient++;
      positionSkills.set(pos, entry);
    }

    const weakPositions = Array.from(positionSkills.values())
      .filter((p) => p.total >= 2)
      .sort((a, b) => (a.proficient / a.total) - (b.proficient / b.total))
      .slice(0, 3);

    if (weakPositions.length > 0) {
      recommendations.push({
        type: "weak_position",
        title: "Positions to strengthen",
        description: `Your weakest positions are: ${weakPositions.map((p) => p.name).join(", ")}. Spend extra drilling time here.`,
      });
    }

    // 3. Recently taught but not drilled \u2014 techniques from recent classes you attended but haven't progressed
    const recentTechIds = new Set<string>();
    for (const att of student.attendances) {
      for (const ct of att.classSession.techniques) {
        recentTechIds.add(ct.techniqueId);
      }
    }

    const exposedOnly = student.skillProgress.filter(
      (sp) => sp.level === "exposed" && recentTechIds.has(sp.techniqueId)
    );

    if (exposedOnly.length > 0) {
      recommendations.push({
        type: "review",
        title: "Review from recent classes",
        description: "You were exposed to these in class but haven't drilled them yet.",
        techniques: exposedOnly.slice(0, 5).map((sp) => ({ name: sp.technique.name, position: sp.technique.position.name })),
      });
    }

    // 4. Streak encouragement
    if (student.currentStreak > 0) {
      recommendations.push({
        type: "streak",
        title: `${student.currentStreak}-day streak!`,
        description: student.currentStreak >= student.longestStreak
          ? "You're on your longest streak ever. Keep it going!"
          : `Your best is ${student.longestStreak} days. Keep pushing!`,
      });
    } else {
      recommendations.push({
        type: "streak",
        title: "Get back on the mat",
        description: "Your streak reset. One class today restarts it.",
      });
    }

    return NextResponse.json({
      recommendations,
      milestone: { name: currentMilestone.name, slug: currentMilestone.slug },
    });
  } catch {
    return NextResponse.json({ recommendations: [] });
  }
}
