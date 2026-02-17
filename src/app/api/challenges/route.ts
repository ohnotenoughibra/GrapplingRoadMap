import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const challenges = await prisma.challenge.findMany({
      where: { active: true },
      include: {
        creator: { select: { name: true } },
        participants: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ challenges });
  } catch {
    return NextResponse.json({ challenges: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    let creatorId: string;

    if (user) {
      creatorId = user.id;
    } else {
      const coach = await prisma.user.findFirst({ where: { role: "coach" } });
      if (!coach) return NextResponse.json({ error: "No user" }, { status: 401 });
      creatorId = coach.id;
    }

    const { title, description, type, target, startDate, endDate } = await request.json();

    if (!title || !type || !target || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const challenge = await prisma.challenge.create({
      data: {
        title,
        description: description || "",
        type,
        target,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        creatorId,
      },
      include: { creator: { select: { name: true } } },
    });

    return NextResponse.json(challenge, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create challenge" }, { status: 500 });
  }
}
