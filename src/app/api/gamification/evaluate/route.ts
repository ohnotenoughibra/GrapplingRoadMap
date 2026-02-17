import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        attendances: true,
        skillProgress: { include: { technique: true } },
        badges: true,
        feedPosts: true,
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const earnedBadgeSlugs = new Set(user.badges.map((ub) => ub.badge?.slug).filter(Boolean));
    // Refetch with badge data
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
    });
    const earnedSlugs = new Set(userBadges.map((ub) => ub.badge.slug));

    const allBadges = await prisma.badge.findMany();
    const newlyEarned: string[] = [];

    const classCount = user.attendances.length;
    const proficientCount = user.skillProgress.filter((s) => s.level === "proficient").length;
    const subCount = user.skillProgress.filter((s) => s.level === "proficient" && s.technique.category === "submission").length;
    const sweepCount = user.skillProgress.filter((s) => s.level === "proficient" && s.technique.category === "sweep").length;
    const passCount = user.skillProgress.filter((s) => s.level === "proficient" && s.technique.category === "pass").length;
    const escapeCount = user.skillProgress.filter((s) => s.level === "proficient" && s.technique.category === "escape").length;
    const legLockCount = user.skillProgress.filter((s) => s.level === "proficient" && s.technique.name.toLowerCase().includes("heel") || s.technique.name.toLowerCase().includes("knee") && s.technique.category === "submission").length;
    const postCount = user.feedPosts.length;
    const checkinCount = user.feedPosts.filter((p) => p.type === "checkin").length;

    // Milestone completion
    const milestones = await prisma.milestone.findMany({
      include: { techniques: true },
    });

    const proficientIds = new Set(
      user.skillProgress.filter((s) => s.level === "proficient").map((s) => s.techniqueId)
    );

    for (const badge of allBadges) {
      if (earnedSlugs.has(badge.slug)) continue;

      let earned = false;

      switch (badge.slug) {
        case "first-roll": earned = classCount >= 1; break;
        case "consistent": earned = user.currentStreak >= 3; break;
        case "iron-will": earned = user.longestStreak >= 30; break;
        case "century": earned = classCount >= 100; break;
        case "mat-rat": earned = classCount >= 250; break;
        case "lifer": earned = classCount >= 500; break;
        case "first-sub": earned = subCount >= 1; break;
        case "submission-hunter": earned = subCount >= 10; break;
        case "guard-player": earned = sweepCount >= 5; break;
        case "passer": earned = passCount >= 5; break;
        case "escape-artist": earned = escapeCount >= 5; break;
        case "leg-locker": earned = legLockCount >= 3; break;
        case "team-player": earned = postCount >= 10; break;
        case "motivator": earned = checkinCount >= 50; break;
        case "explorer-complete": {
          const explorer = milestones.find((m) => m.slug === "explorer");
          if (explorer) earned = explorer.techniques.every((t) => proficientIds.has(t.techniqueId));
          break;
        }
        case "traveler-complete": {
          const traveler = milestones.find((m) => m.slug === "traveler");
          if (traveler) earned = traveler.techniques.every((t) => proficientIds.has(t.techniqueId));
          break;
        }
        case "navigator-complete": {
          const navigator = milestones.find((m) => m.slug === "navigator");
          if (navigator) earned = navigator.techniques.every((t) => proficientIds.has(t.techniqueId));
          break;
        }
        case "guide-complete": {
          const guide = milestones.find((m) => m.slug === "guide");
          if (guide) earned = guide.techniques.every((t) => proficientIds.has(t.techniqueId));
          break;
        }
      }

      if (earned) {
        await prisma.userBadge.create({
          data: { userId, badgeId: badge.id },
        });
        newlyEarned.push(badge.slug);

        // Create feed post for badge
        await prisma.feedPost.create({
          data: {
            userId,
            type: "badge",
            content: `Earned the "${badge.name}" badge! ${badge.icon}`,
          },
        });

        // Award XP for badge
        await prisma.user.update({
          where: { id: userId },
          data: { xp: { increment: 100 } },
        });
      }
    }

    return NextResponse.json({ newlyEarned, totalBadges: earnedSlugs.size + newlyEarned.length });
  } catch (e) {
    return NextResponse.json({ error: "Failed to evaluate badges" }, { status: 500 });
  }
}
