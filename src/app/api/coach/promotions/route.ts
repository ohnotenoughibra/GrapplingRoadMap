import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const studentId = request.nextUrl.searchParams.get("studentId");

    const where = studentId ? { studentId } : {};

    const promotions = await prisma.beltPromotion.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, beltRank: true } },
        coach: { select: { name: true } },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ promotions });
  } catch {
    return NextResponse.json({ promotions: [] });
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
      if (!coach) return NextResponse.json({ error: "No coach" }, { status: 401 });
      coachId = coach.id;
    }

    const { studentId, toBelt, stripes, notes } = await request.json();

    if (!studentId || !toBelt) {
      return NextResponse.json({ error: "studentId and toBelt required" }, { status: 400 });
    }

    const student = await prisma.user.findUnique({ where: { id: studentId } });
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    const promotion = await prisma.beltPromotion.create({
      data: {
        studentId,
        coachId,
        fromBelt: student.beltRank,
        toBelt,
        stripes: stripes || 0,
        notes: notes || null,
      },
      include: {
        student: { select: { name: true } },
        coach: { select: { name: true } },
      },
    });

    // Update student's belt rank
    await prisma.user.update({
      where: { id: studentId },
      data: { beltRank: toBelt },
    });

    // Create feed post about the promotion
    await prisma.feedPost.create({
      data: {
        userId: studentId,
        type: "milestone",
        content: `Promoted to ${toBelt} belt!`,
      },
    });

    return NextResponse.json(promotion, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create promotion" }, { status: 500 });
  }
}
