import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

// GET: Get attendance for a class
export async function GET(request: NextRequest) {
  try {
    const classId = request.nextUrl.searchParams.get("classId");

    const allStudents = await prisma.user.findMany({
      where: { role: "student" },
      select: { id: true, name: true, email: true, beltRank: true },
    });

    if (!classId) {
      return NextResponse.json({ students: allStudents });
    }

    const attendees = await prisma.classAttendance.findMany({
      where: { classSessionId: classId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({ attendees, students: allStudents });
  } catch {
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

// POST: Mark attendance for a class
export async function POST(request: NextRequest) {
  try {
    const { classSessionId, studentIds } = await request.json();

    if (!classSessionId || !Array.isArray(studentIds)) {
      return NextResponse.json({ error: "classSessionId and studentIds required" }, { status: 400 });
    }

    // Remove existing attendance for this class
    await prisma.classAttendance.deleteMany({ where: { classSessionId } });

    // Create new attendance records
    const records = await Promise.all(
      studentIds.map((userId: string) =>
        prisma.classAttendance.create({
          data: { classSessionId, userId, checkedIn: true },
        })
      )
    );

    // Update streaks and XP for each student
    const classSession = await prisma.classSession.findUnique({ where: { id: classSessionId } });

    for (const userId of studentIds) {
      const student = await prisma.user.findUnique({ where: { id: userId } });
      if (!student) continue;

      const now = new Date();
      const lastTrained = student.lastTrainedAt;
      let newStreak = student.currentStreak;

      if (lastTrained) {
        const diffDays = Math.floor((now.getTime() - lastTrained.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 2) {
          newStreak = student.currentStreak + 1;
        } else {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          lastTrainedAt: now,
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, student.longestStreak),
          xp: { increment: 25 },
        },
      });

      // Auto-expose students to techniques taught in class
      const classTechniques = await prisma.classTechnique.findMany({
        where: { classSessionId },
      });

      for (const ct of classTechniques) {
        await prisma.studentSkill.upsert({
          where: { userId_techniqueId: { userId, techniqueId: ct.techniqueId } },
          update: {},  // Don't downgrade existing level
          create: { userId, techniqueId: ct.techniqueId, level: "exposed" },
        });
      }
    }

    return NextResponse.json({ success: true, count: records.length });
  } catch (e) {
    return NextResponse.json({ error: "Failed to mark attendance" }, { status: 500 });
  }
}
