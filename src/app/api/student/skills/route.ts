import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ skills: [] });

    const skills = await prisma.studentSkill.findMany({
      where: { userId: user.id },
      select: { techniqueId: true, level: true },
    });

    return NextResponse.json({ skills });
  } catch {
    return NextResponse.json({ skills: [] });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    return handleSkillUpdate(user.id, request);
  } catch {
    return NextResponse.json({ error: "Failed to update skill" }, { status: 500 });
  }
}

async function handleSkillUpdate(userId: string, request: NextRequest) {
  const { techniqueId, level } = await request.json();

  if (!techniqueId || !level) {
    return NextResponse.json({ error: "techniqueId and level required" }, { status: 400 });
  }

  const validLevels = ["exposed", "drilling", "sparring", "proficient"];
  if (!validLevels.includes(level)) {
    return NextResponse.json({ error: "Invalid level" }, { status: 400 });
  }

  const skill = await prisma.studentSkill.upsert({
    where: { userId_techniqueId: { userId, techniqueId } },
    update: { level },
    create: { userId, techniqueId, level },
  });

  // Award XP for skill progression
  const xpMap: Record<string, number> = { exposed: 5, drilling: 10, sparring: 20, proficient: 50 };
  await prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: xpMap[level] || 0 } },
  });

  return NextResponse.json(skill);
}
