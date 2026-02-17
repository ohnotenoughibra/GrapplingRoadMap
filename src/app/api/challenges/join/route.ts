import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    let userId: string;

    if (user) {
      userId = user.id;
    } else {
      const student = await prisma.user.findFirst({ where: { role: "student" } });
      if (!student) return NextResponse.json({ error: "No user" }, { status: 401 });
      userId = student.id;
    }

    const { challengeId } = await request.json();

    if (!challengeId) {
      return NextResponse.json({ error: "challengeId required" }, { status: 400 });
    }

    const participant = await prisma.challengeParticipant.upsert({
      where: { challengeId_userId: { challengeId, userId } },
      update: {},
      create: { challengeId, userId },
    });

    return NextResponse.json(participant, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to join challenge" }, { status: 500 });
  }
}
