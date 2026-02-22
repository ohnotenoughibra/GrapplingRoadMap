import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

interface Alert {
  type: "streak_dying" | "stuck_skill" | "imbalance" | "promotion_ready" | "inactive" | "new_milestone";
  priority: "high" | "medium" | "low";
  student: { id: string; name: string; beltRank: string };
  title: string;
  detail: string;
  action?: string;
}

interface ClassSuggestion {
  title: string;
  discipline: string;
  reason: string;
  techniques: { id: string; name: string; position: string }[];
  coverage: number; // % of students who need this
}

/**
 * Coach Intelligence Dashboard API
 * Zero-click insights: what needs attention RIGHT NOW
 */
export async function GET() {
  try {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const threeWeeksAgo = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);

    // Fetch all student data in parallel
    const [students, allSkills, recentClasses, allAttendances, sparringLogs] =
      await Promise.all([
        prisma.user.findMany({
          where: { role: "student" },
          select: {
            id: true,
            name: true,
            beltRank: true,
            currentStreak: true,
            longestStreak: true,
            lastTrainedAt: true,
            xp: true,
            joinedAt: true,
          },
        }),
        prisma.studentSkill.findMany({
          include: {
            technique: { include: { position: true } },
            user: { select: { id: true, name: true } },
          },
        }),
        prisma.classSession.findMany({
          where: { date: { gte: twoWeeksAgo } },
          include: {
            techniques: { include: { technique: { include: { position: true } } } },
            attendees: true,
          },
          orderBy: { date: "desc" },
        }),
        prisma.classAttendance.findMany({
          include: {
            user: { select: { id: true, name: true } },
            classSession: { select: { date: true } },
          },
        }),
        prisma.sparringLog.findMany({
          where: { date: { gte: twoWeeksAgo } },
        }),
      ]);

    const alerts: Alert[] = [];

    // ── ALERT: Streak dying ──────────────────────────────────
    for (const student of students) {
      if (student.currentStreak >= 5 && student.lastTrainedAt) {
        const daysSince = Math.floor(
          (now.getTime() - new Date(student.lastTrainedAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSince >= 3) {
          alerts.push({
            type: "streak_dying",
            priority: "high",
            student: { id: student.id, name: student.name, beltRank: student.beltRank },
            title: `${student.name}'s streak is dying`,
            detail: `Was on a ${student.currentStreak}-day streak but hasn't trained in ${daysSince} days. Longest streak: ${student.longestStreak} days.`,
            action: "Send encouragement or check in",
          });
        }
      }
    }

    // ── ALERT: Inactive students ─────────────────────────────
    for (const student of students) {
      if (student.lastTrainedAt) {
        const daysSince = Math.floor(
          (now.getTime() - new Date(student.lastTrainedAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSince >= 10) {
          alerts.push({
            type: "inactive",
            priority: daysSince >= 14 ? "high" : "medium",
            student: { id: student.id, name: student.name, beltRank: student.beltRank },
            title: `${student.name} hasn't trained in ${daysSince} days`,
            detail: `Last seen on the mat ${new Date(student.lastTrainedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}. They may need a check-in.`,
            action: "Reach out",
          });
        }
      }
    }

    // ── ALERT: Stuck on a skill ──────────────────────────────
    const skillsByStudent = allSkills.reduce((acc, s) => {
      if (!acc[s.userId]) acc[s.userId] = [];
      acc[s.userId].push(s);
      return acc;
    }, {} as Record<string, typeof allSkills>);

    for (const [studentId, studentSkills] of Object.entries(skillsByStudent)) {
      const student = students.find((s) => s.id === studentId);
      if (!student) continue;

      const stuckSkills = studentSkills.filter((s) => {
        const daysSinceUpdate = Math.floor(
          (now.getTime() - new Date(s.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        return (s.level === "drilling" || s.level === "exposed") && daysSinceUpdate >= 21;
      });

      if (stuckSkills.length >= 3) {
        const topStuck = stuckSkills.slice(0, 3).map((s) => s.technique.name);
        alerts.push({
          type: "stuck_skill",
          priority: "medium",
          student: { id: student.id, name: student.name, beltRank: student.beltRank },
          title: `${student.name} is stuck on ${stuckSkills.length} techniques`,
          detail: `${topStuck.join(", ")} haven't progressed in 3+ weeks. Consider drilling these in class.`,
          action: "Focus class on these areas",
        });
      }
    }

    // ── ALERT: Sparring imbalance ────────────────────────────
    for (const student of students) {
      const studentLogs = sparringLogs.filter((l) => l.userId === student.id);
      if (studentLogs.length < 3) continue;

      let subsHit = 0;
      let subsCaught = 0;
      for (const log of studentLogs) {
        if (log.submissions) {
          try { subsHit += JSON.parse(log.submissions).length; } catch { /* ok */ }
        }
        if (log.caughtIn) {
          try { subsCaught += JSON.parse(log.caughtIn).length; } catch { /* ok */ }
        }
      }

      if (subsCaught > 0 && subsHit === 0) {
        alerts.push({
          type: "imbalance",
          priority: "medium",
          student: { id: student.id, name: student.name, beltRank: student.beltRank },
          title: `${student.name} is only getting caught`,
          detail: `${subsCaught} submissions received, 0 landed in the last 2 weeks. Needs confidence-building offense work.`,
          action: "Pair with similar-level partner for positional sparring",
        });
      }
    }

    // ── ALERT: Promotion ready ───────────────────────────────
    for (const [studentId, studentSkills] of Object.entries(skillsByStudent)) {
      const student = students.find((s) => s.id === studentId);
      if (!student) continue;

      const proficientCount = studentSkills.filter((s) => s.level === "proficient").length;
      const totalTracked = studentSkills.length;
      const studentAttendances = allAttendances.filter((a) => a.userId === studentId);

      if (totalTracked >= 20 && proficientCount / totalTracked >= 0.7 && studentAttendances.length >= 50) {
        alerts.push({
          type: "promotion_ready",
          priority: "low",
          student: { id: student.id, name: student.name, beltRank: student.beltRank },
          title: `${student.name} may be ready for promotion`,
          detail: `${proficientCount}/${totalTracked} techniques proficient (${Math.round(proficientCount / totalTracked * 100)}%). ${studentAttendances.length} classes attended. Current belt: ${student.beltRank}.`,
          action: "Schedule evaluation",
        });
      }
    }

    // Sort alerts by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    // ── SMART CLASS SUGGESTION ───────────────────────────────
    // Find the biggest team-wide gap
    const allTechniques = await prisma.technique.findMany({
      where: { difficulty: "fundamental" },
      include: { position: true },
    });

    const techniqueCoverage: Record<string, { technique: typeof allTechniques[0]; studentsWeak: number }> = {};

    for (const tech of allTechniques) {
      const studentSkillsForTech = allSkills.filter((s) => s.techniqueId === tech.id);
      const studentsWithoutProficiency = students.length - studentSkillsForTech.filter((s) => s.level === "proficient").length;

      techniqueCoverage[tech.id] = {
        technique: tech,
        studentsWeak: studentsWithoutProficiency,
      };
    }

    // Group by position to find the weakest area
    const positionWeakness: Record<string, { position: string; totalWeak: number; techniques: typeof allTechniques }> = {};

    for (const [, data] of Object.entries(techniqueCoverage)) {
      const posName = data.technique.position.name;
      if (!positionWeakness[posName]) {
        positionWeakness[posName] = { position: posName, totalWeak: 0, techniques: [] };
      }
      positionWeakness[posName].totalWeak += data.studentsWeak;
      positionWeakness[posName].techniques.push(data.technique);
    }

    const weakestPosition = Object.values(positionWeakness)
      .sort((a, b) => b.totalWeak - a.totalWeak)[0];

    let classSuggestion: ClassSuggestion | null = null;

    if (weakestPosition && students.length > 0) {
      const suggestedTechniques = weakestPosition.techniques
        .sort((a, b) => {
          const aWeak = techniqueCoverage[a.id]?.studentsWeak || 0;
          const bWeak = techniqueCoverage[b.id]?.studentsWeak || 0;
          return bWeak - aWeak;
        })
        .slice(0, 4);

      const avgCoverage = Math.round(
        (weakestPosition.totalWeak / (weakestPosition.techniques.length * students.length)) * 100
      );

      classSuggestion = {
        title: `${weakestPosition.position} Fundamentals`,
        discipline: "all",
        reason: `${avgCoverage}% of your students need work on ${weakestPosition.position} techniques.`,
        techniques: suggestedTechniques.map((t) => ({
          id: t.id,
          name: t.name,
          position: t.position.name,
        })),
        coverage: avgCoverage,
      };
    }

    // ── TEAM STATS ───────────────────────────────────────────
    const classesThisWeek = recentClasses.filter(
      (c) => new Date(c.date) >= oneWeekAgo
    ).length;

    const activeStudents = students.filter(
      (s) => s.lastTrainedAt && new Date(s.lastTrainedAt) >= twoWeeksAgo
    ).length;

    const avgStreak =
      students.length > 0
        ? Math.round(students.reduce((sum, s) => sum + s.currentStreak, 0) / students.length)
        : 0;

    return NextResponse.json({
      alerts,
      classSuggestion,
      teamStats: {
        totalStudents: students.length,
        activeStudents,
        classesThisWeek,
        avgStreak,
        classesTotal: recentClasses.length,
      },
    });
  } catch (error) {
    console.error("Coach intelligence error:", error);
    return NextResponse.json({
      alerts: [],
      classSuggestion: null,
      teamStats: { totalStudents: 0, activeStudents: 0, classesThisWeek: 0, avgStreak: 0, classesTotal: 0 },
    });
  }
}
