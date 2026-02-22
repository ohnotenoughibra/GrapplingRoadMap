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

    // Create new attendance records in bulk
    await prisma.classAttendance.createMany({
      data: studentIds.map((userId: string) => ({ classSessionId, userId, checkedIn: true })),
    });

    // Fetch all students and class techniques in one query each
    const [students, classTechniques] = await Promise.all([
      prisma.user.findMany({
        where: { id: { in: studentIds } },
        select: { id: true, currentStreak: true, longestStreak: true, lastTrainedAt: true },
      }),
      prisma.classTechnique.findMany({ where: { classSessionId } }),
    ]);

    // Update streaks, XP, and auto-expose techniques
    const now = new Date();
    const operations = [];

    for (const student of students) {
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
      for (const ct of classTechniques) {
        operations.push(
          prisma.studentSkill.upsert({
            where: { userId_techniqueId: { userId: student.id, techniqueId: ct.techniqueId } },
            update: {},
            create: { userId: student.id, techniqueId: ct.techniqueId, level: "exposed" },
          })
        );
      }
    }

    await prisma.$transaction(operations);

    return NextResponse.json({ success: true, count: studentIds.length });
  } catch (e) {
    return NextResponse.json({ error: "Failed to mark attendance" }, { status: 500 });
  }
}
