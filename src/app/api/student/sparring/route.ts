import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ logs: [] });

    const logs = await prisma.sparringLog.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 50,
    });
    return NextResponse.json({ logs });
  } catch {
    return NextResponse.json({ logs: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const body = await request.json();
    const { partner, rounds, duration, notes, submissions, caughtIn, positions, mood, date } = body;

    const log = await prisma.sparringLog.create({
      data: {
        userId: user.id,
        date: date ? new Date(date) : new Date(),
        partner,
        rounds: rounds || 1,
        duration: duration || null,
        notes: notes || null,
        submissions: submissions ? JSON.stringify(submissions) : null,
        caughtIn: caughtIn ? JSON.stringify(caughtIn) : null,
        positions: positions ? JSON.stringify(positions) : null,
        mood: mood || null,
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to log sparring" }, { status: 500 });
  }
}
