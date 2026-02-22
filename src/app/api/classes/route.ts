import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const classes = await prisma.classSession.findMany({
      orderBy: { date: "desc" },
      include: {
        techniques: { include: { technique: { include: { position: true } } } },
        attendees: { include: { user: { select: { id: true, name: true, email: true, beltRank: true } } } },
        coach: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ classes });
  } catch {
    return NextResponse.json({ classes: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, discipline, title, notes, techniqueIds, attendeeIds } = body;

    const coach = await getCurrentUser();
    if (!coach || (coach.role !== "coach" && coach.role !== "admin")) {
      return NextResponse.json({ error: "Coach access required" }, { status: 403 });
    }

    const classSession = await prisma.classSession.create({
      data: {
        date: new Date(date),
        discipline,
        title: title || null,
        notes: notes || null,
        coachId: coach.id,
        techniques: {
          create: techniqueIds.map((id: string) => ({
            techniqueId: id,
          })),
        },
        attendees: attendeeIds?.length
          ? {
              create: (attendeeIds as string[]).map((userId: string) => ({
                userId,
              })),
            }
          : undefined,
      },
      include: {
        techniques: { include: { technique: true } },
        attendees: { include: { user: { select: { id: true, name: true, email: true, beltRank: true } } } },
      },
    });

    // Auto-expose attendees to class techniques (batched in a single transaction)
    if (attendeeIds?.length && techniqueIds?.length) {
      const upserts = (attendeeIds as string[]).flatMap((studentId) =>
        (techniqueIds as string[]).map((techId) =>
          prisma.studentSkill.upsert({
            where: { userId_techniqueId: { userId: studentId, techniqueId: techId } },
            update: { updatedAt: new Date() },
            create: { userId: studentId, techniqueId: techId, level: "exposed" },
          })
        )
      );
      await prisma.$transaction(upserts);
    }

    return NextResponse.json(classSession, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create class. Is the database connected?" }, { status: 500 });
  }
}
