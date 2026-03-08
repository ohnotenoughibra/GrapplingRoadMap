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
    const { date, discipline, title, notes, techniqueIds, techniques: techniquesInput, attendeeIds } = body;

    const coach = await getCurrentUser();
    if (!coach || (coach.role !== "coach" && coach.role !== "admin")) {
      return NextResponse.json({ error: "Coach access required" }, { status: 403 });
    }

    // Support both formats:
    // Old: techniqueIds: string[]
    // New: techniques: { id: string, notes?: string }[]
    const techniqueEntries: { id: string; notes?: string }[] = techniquesInput
      ? (techniquesInput as { id: string; notes?: string }[])
      : (techniqueIds as string[]).map((id: string) => ({ id }));

    const resolvedTechniqueIds = techniqueEntries.map((t) => t.id);

    const classSession = await prisma.classSession.create({
      data: {
        date: new Date(date),
        discipline,
        title: title || null,
        notes: notes || null,
        coachId: coach.id,
        techniques: {
          create: techniqueEntries.map((t) => ({
            techniqueId: t.id,
            notes: t.notes || null,
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

    // Update attendee progression: XP, streaks, and auto-expose to techniques
    if (attendeeIds?.length) {
      const students = await prisma.user.findMany({
        where: { id: { in: attendeeIds as string[] } },
        select: { id: true, currentStreak: true, longestStreak: true, lastTrainedAt: true },
      });

      const now = new Date();
      const operations = [];

      for (const student of students) {
        // Streak calculation
        const lastTrained = student.lastTrainedAt;
        let newStreak = 1;
        if (lastTrained) {
          const diffDays = Math.floor((now.getTime() - lastTrained.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays <= 2) newStreak = student.currentStreak + 1;
        }

        operations.push(
          prisma.user.update({
            where: { id: student.id },
            data: {
              lastTrainedAt: now,
              currentStreak: newStreak,
              longestStreak: Math.max(newStreak, student.longestStreak),
              xp: { increment: 25 },
            },
          })
        );

        // Auto-expose to class techniques
        if (resolvedTechniqueIds.length) {
          for (const techId of resolvedTechniqueIds) {
            operations.push(
              prisma.studentSkill.upsert({
                where: { userId_techniqueId: { userId: student.id, techniqueId: techId } },
                update: { updatedAt: new Date() },
                create: { userId: student.id, techniqueId: techId, level: "exposed" },
              })
            );
          }
        }
      }

      await prisma.$transaction(operations);
    }

    return NextResponse.json(classSession, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create class. Is the database connected?" }, { status: 500 });
  }
}
