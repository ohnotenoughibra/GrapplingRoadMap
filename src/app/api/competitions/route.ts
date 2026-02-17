import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    let userId: string;

    if (user) {
      userId = user.id;
    } else {
      const student = await prisma.user.findFirst({ where: { role: "student" } });
      if (!student) return NextResponse.json({ competitions: [] });
      userId = student.id;
    }

    const competitions = await prisma.competition.findMany({
      where: { userId },
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
    let userId: string;

    if (user) {
      userId = user.id;
    } else {
      const student = await prisma.user.findFirst({ where: { role: "student" } });
      if (!student) return NextResponse.json({ error: "No user" }, { status: 401 });
      userId = student.id;
    }

    const body = await request.json();
    const { name, date, location, discipline, weightClass, result, wins, losses, submissionBy, submittedBy, notes, gamePlan } = body;

    if (!name || !date || !discipline) {
      return NextResponse.json({ error: "name, date, and discipline required" }, { status: 400 });
    }

    const comp = await prisma.competition.create({
      data: {
        userId,
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
