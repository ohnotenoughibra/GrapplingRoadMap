import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const studentId = request.nextUrl.searchParams.get("studentId");
    if (!studentId) return NextResponse.json({ error: "studentId required" }, { status: 400 });

    const notes = await prisma.coachNote.findMany({
      where: { studentId },
      include: { coach: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ notes });
  } catch {
    return NextResponse.json({ notes: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    let coachId: string;

    if (user && (user.role === "coach" || user.role === "admin")) {
      coachId = user.id;
    } else {
      const coach = await prisma.user.findFirst({ where: { role: "coach" } });
      if (!coach) return NextResponse.json({ error: "No coach found" }, { status: 404 });
      coachId = coach.id;
    }

    const { studentId, content } = await request.json();

    if (!studentId || !content) {
      return NextResponse.json({ error: "studentId and content required" }, { status: 400 });
    }

    const note = await prisma.coachNote.create({
      data: { coachId, studentId, content },
      include: { coach: { select: { name: true } } },
    });

    return NextResponse.json(note, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
