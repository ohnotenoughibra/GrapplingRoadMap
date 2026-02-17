import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const ids = request.nextUrl.searchParams.get("ids")?.split(",") || [];

    if (ids.length < 2) {
      return NextResponse.json({ error: "At least 2 student IDs required" }, { status: 400 });
    }

    const students = await prisma.user.findMany({
      where: { id: { in: ids }, role: "student" },
      include: {
        skillProgress: { include: { technique: { include: { position: true } } } },
        attendances: true,
        badges: { include: { badge: true } },
      },
    });

    const result = students.map((s) => ({
      id: s.id,
      name: s.name,
      xp: s.xp,
      currentStreak: s.currentStreak,
      longestStreak: s.longestStreak,
      totalClasses: s.attendances.length,
      beltRank: s.beltRank,
      skills: {
        total: s.skillProgress.length,
        proficient: s.skillProgress.filter((sp) => sp.level === "proficient").length,
        sparring: s.skillProgress.filter((sp) => sp.level === "sparring").length,
        drilling: s.skillProgress.filter((sp) => sp.level === "drilling").length,
        exposed: s.skillProgress.filter((sp) => sp.level === "exposed").length,
      },
      skillsByPosition: s.skillProgress.reduce((acc, sp) => {
        const pos = sp.technique.position.name;
        if (!acc[pos]) acc[pos] = { proficient: 0, sparring: 0, drilling: 0, exposed: 0 };
        acc[pos][sp.level as keyof typeof acc[typeof pos]]++;
        return acc;
      }, {} as Record<string, Record<string, number>>),
      badges: s.badges.map((ub) => ({ name: ub.badge.name, icon: ub.badge.icon })),
    }));

    return NextResponse.json({ students: result });
  } catch {
    return NextResponse.json({ error: "Failed to compare students" }, { status: 500 });
  }
}
