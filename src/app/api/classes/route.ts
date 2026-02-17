import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const classes = await prisma.classSession.findMany({
    orderBy: { date: "desc" },
    include: {
      techniques: { include: { technique: { include: { position: true } } } },
      attendees: { include: { user: true } },
      coach: true,
    },
  });

  return NextResponse.json({ classes });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { date, discipline, title, notes, techniqueIds } = body;

  // For MVP, use the first coach
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
    },
    include: {
      techniques: { include: { technique: true } },
    },
  });

  return NextResponse.json(classSession, { status: 201 });
}
