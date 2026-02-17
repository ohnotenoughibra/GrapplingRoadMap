import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const student = await prisma.user.findFirst({
      where: { role: "student" },
      include: {
        badges: { include: { badge: true } },
      },
    });

    const earnedBadgeIds = new Set(
      (student?.badges ?? []).map((ub) => ub.badgeId)
    );

    const allBadges = await prisma.badge.findMany({
      orderBy: { category: "asc" },
    });

    const badges = allBadges.map((b) => {
      const userBadge = student?.badges.find((ub) => ub.badgeId === b.id);
      return {
        id: b.id,
        name: b.name,
        slug: b.slug,
        description: b.description,
        icon: b.icon,
        category: b.category,
        earned: earnedBadgeIds.has(b.id),
        earnedAt: userBadge?.earnedAt?.toISOString() ?? null,
      };
    });

    return NextResponse.json({ badges });
  } catch {
    return NextResponse.json({ badges: [] });
  }
}
