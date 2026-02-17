import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

const EMPTY_DASHBOARD = {
  user: { name: "New Student", xp: 0, currentStreak: 0, longestStreak: 0, joinedAt: new Date().toISOString() },
  totalClasses: 0,
  skillStats: { exposed: 0, drilling: 0, sparring: 0, proficient: 0, total: 0 },
  recentClasses: [],
  currentMilestone: { name: "Explorer", slug: "explorer", progress: 0, total: 0 },
  badges: [],
};

export async function GET() {
  try {
    const student = await prisma.user.findFirst({
      where: { role: "student" },
      include: {
        attendances: {
          include: {
            classSession: {
              include: {
                techniques: { include: { technique: true } },
              },
            },
          },
          orderBy: { classSession: { date: "desc" } },
          take: 5,
        },
        skillProgress: true,
        badges: { include: { badge: true } },
      },
    });

    if (!student) {
      return NextResponse.json(EMPTY_DASHBOARD);
    }

    const skillStats = {
      exposed: student.skillProgress.filter((s) => s.level === "exposed").length,
      drilling: student.skillProgress.filter((s) => s.level === "drilling").length,
      sparring: student.skillProgress.filter((s) => s.level === "sparring").length,
      proficient: student.skillProgress.filter((s) => s.level === "proficient").length,
      total: student.skillProgress.length,
    };

    const explorer = await prisma.milestone.findUnique({
      where: { slug: "explorer" },
      include: { techniques: true },
    });

    const proficientIds = new Set(
      student.skillProgress
        .filter((s) => s.level === "proficient")
        .map((s) => s.techniqueId)
    );

    const currentMilestone = {
      name: "Explorer",
      slug: "explorer",
      progress: explorer
        ? explorer.techniques.filter((t) => proficientIds.has(t.techniqueId)).length
        : 0,
      total: explorer?.techniques.length ?? 0,
    };

    const recentClasses = student.attendances.map((a) => ({
      id: a.classSession.id,
      date: a.classSession.date.toISOString(),
      discipline: a.classSession.discipline,
      title: a.classSession.title,
      techniques: a.classSession.techniques.map((ct) => ({
        technique: { name: ct.technique.name },
      })),
    }));

    return NextResponse.json({
      user: {
        name: student.name,
        xp: student.xp,
        currentStreak: student.currentStreak,
        longestStreak: student.longestStreak,
        joinedAt: student.joinedAt.toISOString(),
      },
      totalClasses: student.attendances.length,
      skillStats,
      recentClasses,
      currentMilestone,
      badges: student.badges.map((ub) => ({
        badge: { name: ub.badge.name, icon: ub.badge.icon },
      })),
    });
  } catch {
    return NextResponse.json(EMPTY_DASHBOARD);
  }
}
