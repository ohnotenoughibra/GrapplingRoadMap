import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const classes = await prisma.classSession.findMany({
      orderBy: { date: "desc" },
      include: {
        techniques: { include: { technique: { include: { position: true } } } },
        attendees: { include: { user: true } },
        coach: true,
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

    let coach = await prisma.user.findFirst({ where: { role: "coach" } });
    if (!coach) {
      coach = await prisma.user.create({
        data: {
          name: "Coach",
          email: "coach@rootscollective.com",
          role: "coach",
        },
      });
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
        attendees: { include: { user: true } },
      },
    });

    // Auto-update student skill progress for attendees
    if (attendeeIds?.length && techniqueIds?.length) {
      for (const studentId of attendeeIds as string[]) {
        for (const techId of techniqueIds as string[]) {
          await prisma.studentSkill.upsert({
            where: { userId_techniqueId: { userId: studentId, techniqueId: techId } },
            update: { updatedAt: new Date() },
            create: { userId: studentId, techniqueId: techId, level: "exposed" },
          });
        }
      }
    }

    return NextResponse.json(classSession, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create class. Is the database connected?" }, { status: 500 });
  }
}
