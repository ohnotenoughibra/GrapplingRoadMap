import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const { challengeId } = await request.json();

    if (!challengeId) {
      return NextResponse.json({ error: "challengeId required" }, { status: 400 });
    }

    const participant = await prisma.challengeParticipant.upsert({
      where: { challengeId_userId: { challengeId, userId: user.id } },
      update: {},
      create: { challengeId, userId: user.id },
    });

    return NextResponse.json(participant, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to join challenge" }, { status: 500 });
  }
}
