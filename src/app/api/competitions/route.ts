import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ competitions: [] });

    const competitions = await prisma.competition.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ competitions });
  } catch {
    return NextResponse.json({ competitions: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const body = await request.json();
    const { name, date, location, discipline, weightClass, result, wins, losses, submissionBy, submittedBy, notes, gamePlan } = body;

    if (!name || !date || !discipline) {
      return NextResponse.json({ error: "name, date, and discipline required" }, { status: 400 });
    }

    const comp = await prisma.competition.create({
      data: {
        userId: user.id,
        name,
        date: new Date(date),
        location: location || null,
        discipline,
        weightClass: weightClass || null,
        result: result || null,
        wins: wins || 0,
        losses: losses || 0,
        submissionBy: submissionBy || null,
        submittedBy: submittedBy || null,
        notes: notes || null,
        gamePlan: gamePlan || null,
      },
    });

    return NextResponse.json(comp, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create competition" }, { status: 500 });
  }
}
