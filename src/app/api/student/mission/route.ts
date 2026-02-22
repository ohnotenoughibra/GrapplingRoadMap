import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

/**
 * Daily Mission Engine
 * Generates a personalized daily training focus based on:
 * 1. Sparring weaknesses (what you get caught in most)
 * 2. Stale skills (techniques not practiced recently)
 * 3. Milestone gaps (techniques needed for next level)
 * 4. Recent class content (reinforce what was just taught)
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if we already have a mission for today (use prisma if model exists)
    const existingMission = await (prisma as any).dailyMission?.findFirst?.({
      where: { userId, date: today },
      include: { technique: { include: { position: true } } },
    }).catch(() => null) ?? null;

    if (existingMission) {
      return NextResponse.json({ mission: existingMission });
    }

    // Gather intelligence to generate a mission
    const [sparringLogs, skills, recentClasses, milestoneData] = await Promise.all([
      // Last 30 days of sparring
      prisma.sparringLog.findMany({
        where: {
          userId,
          date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        orderBy: { date: "desc" },
        take: 20,
      }),
      // All tracked skills
      prisma.studentSkill.findMany({
        where: { userId },
        include: {
          technique: { include: { position: true } },
        },
      }),
      // Recent classes attended
      prisma.classAttendance.findMany({
        where: { userId },
        include: {
          classSession: {
            include: {
              techniques: { include: { technique: true } },
            },
          },
        },
        orderBy: { classSession: { date: "desc" } },
        take: 5,
      }),
      // Current milestone techniques
      prisma.milestone.findFirst({
        where: { slug: "explorer" },
        include: {
          techniques: {
            include: {
              technique: { include: { position: true } },
            },
          },
        },
      }),
    ]);

    // Strategy 1: Address sparring weaknesses
    const caughtInCounts: Record<string, number> = {};
    for (const log of sparringLogs) {
      if (log.caughtIn) {
        try {
          const caught = JSON.parse(log.caughtIn) as string[];
          for (const sub of caught) {
            caughtInCounts[sub] = (caughtInCounts[sub] || 0) + 1;
          }
        } catch { /* ignore parse errors */ }
      }
    }

    // Strategy 2: Find stale skills (tracked but not recently reinforced)
    const staleSkills = skills
      .filter((s) => s.level !== "proficient")
      .sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
      .slice(0, 5);

    // Strategy 3: Recent class techniques to reinforce
    const recentTechniqueNames = recentClasses
      .flatMap((a) => a.classSession.techniques.map((t) => t.technique))
      .slice(0, 10);

    // Strategy 4: Milestone techniques not yet at proficient
    const milestoneGaps = milestoneData?.techniques
      .filter((mt) => {
        const skill = skills.find((s) => s.techniqueId === mt.techniqueId);
        return !skill || skill.level !== "proficient";
      })
      .map((mt) => mt.technique) || [];

    // Pick the best mission based on priority
    let mission: { title: string; description: string; reason: string; techniqueId?: string } | null = null;

    // Priority 1: If getting caught in something repeatedly
    const topCaught = Object.entries(caughtInCounts).sort((a, b) => b[1] - a[1])[0];
    if (topCaught && topCaught[1] >= 2) {
      const [subName, count] = topCaught;
      // Find an escape technique related to this
      const escapeTechnique = skills.find(
        (s) =>
          s.technique.category === "escape" &&
          s.level !== "proficient"
      );
      mission = {
        title: `Defend the ${subName}`,
        description: `Work on your ${subName.toLowerCase()} defense and escapes. Focus on recognizing the setup early and creating frames before they lock it in.`,
        reason: `You've been caught in ${subName} ${count} times in the last month. Time to close that gap.`,
        techniqueId: escapeTechnique?.techniqueId,
      };
    }

    // Priority 2: Reinforce what was just taught in class
    if (!mission && recentTechniqueNames.length > 0) {
      const recentTech = recentTechniqueNames[0];
      const skill = skills.find((s) => s.techniqueId === recentTech.id);
      if (!skill || skill.level === "exposed" || skill.level === "drilling") {
        mission = {
          title: `Drill: ${recentTech.name}`,
          description: `You saw ${recentTech.name} in class recently. Today, focus on getting reps in during drilling and try to hit it at least once in sparring.`,
          reason: `This was covered in your last class and you're at "${skill?.level || "exposed"}" level. Repetition is how it becomes yours.`,
          techniqueId: recentTech.id,
        };
      }
    }

    // Priority 3: Address stale skills
    if (!mission && staleSkills.length > 0) {
      const stalest = staleSkills[0];
      const daysSince = Math.floor(
        (Date.now() - new Date(stalest.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      mission = {
        title: `Revisit: ${stalest.technique.name}`,
        description: `Your ${stalest.technique.name} from ${stalest.technique.position.name} hasn't been touched in ${daysSince} days. Ask a partner to drill it today.`,
        reason: `Skills decay without practice. This was at "${stalest.level}" level but needs reinforcement.`,
        techniqueId: stalest.techniqueId,
      };
    }

    // Priority 4: Milestone progression
    if (!mission && milestoneGaps.length > 0) {
      const gap = milestoneGaps[Math.floor(Math.random() * Math.min(3, milestoneGaps.length))];
      mission = {
        title: `Explore: ${gap.name}`,
        description: `${gap.name} from ${gap.position.name} is part of your current milestone. Get exposed to it today — watch a video, ask your coach, or try it in drilling.`,
        reason: `This technique is on your progression path but you haven't started tracking it yet.`,
        techniqueId: gap.id,
      };
    }

    // Fallback: generic but still useful
    if (!mission) {
      mission = {
        title: "Open Mat Mindset",
        description: "No specific mission today. Focus on flow rolling — try to connect positions smoothly. If you get stuck, work on escaping rather than forcing attacks.",
        reason: "Sometimes the best training is unstructured. Stay curious on the mat.",
      };
    }

    // Save the mission (use dynamic access for new model)
    const saved = await (prisma as any).dailyMission?.create?.({
      data: {
        userId,
        date: today,
        title: mission.title,
        description: mission.description,
        reason: mission.reason,
        techniqueId: mission.techniqueId || null,
      },
      include: {
        technique: { include: { position: true } },
      },
    }).catch(() => null) ?? null;

    return NextResponse.json({
      mission: saved || {
        id: "generated",
        ...mission,
        date: today.toISOString(),
        status: "pending",
        technique: null,
      },
    });
  } catch (error) {
    console.error("Mission engine error:", error);
    // Return a fallback mission even on error
    return NextResponse.json({
      mission: {
        id: "fallback",
        title: "Get on the mat",
        description: "Show up, train hard, stay humble. The mat doesn't lie.",
        reason: "Every session counts.",
        status: "pending",
        date: new Date().toISOString(),
        technique: null,
      },
    });
  }
}

/**
 * POST: Update mission status after training
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const postUserId = (session?.user as any)?.id as string | undefined;
    if (!postUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { missionId, status, feedback } = body;

    if (!missionId || !status) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const updated = await (prisma as any).dailyMission?.update?.({
      where: { id: missionId },
      data: {
        status, // "completed" | "partial" | "skipped"
        feedback: feedback || null,
      },
    });

    return NextResponse.json({ mission: updated });
  } catch (error) {
    console.error("Mission update error:", error);
    return NextResponse.json({ error: "Failed to update mission" }, { status: 500 });
  }
}
