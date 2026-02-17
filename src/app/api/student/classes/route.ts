import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  const discipline = request.nextUrl.searchParams.get("discipline") || "all";

  // For MVP, use first student
  const student = await prisma.user.findFirst({
    where: { role: "student" },
  });

  const studentId = student?.id;

  const where =
    discipline === "all" ? {} : { discipline };

  const classes = await prisma.classSession.findMany({
    where,
    orderBy: { date: "desc" },
    include: {
      techniques: {
        include: {
          technique: { include: { position: true } },
        },
      },
      coach: { select: { name: true } },
      attendees: true,
    },
  });

  const result = classes.map((cls) => ({
    id: cls.id,
    date: cls.date.toISOString(),
    discipline: cls.discipline,
    title: cls.title,
    notes: cls.notes,
    techniques: cls.techniques.map((ct) => ({
      technique: {
        name: ct.technique.name,
        category: ct.technique.category,
        position: { name: ct.technique.position.name },
      },
    })),
    coach: cls.coach,
    attended: studentId
      ? cls.attendees.some((a) => a.userId === studentId)
      : false,
  }));

  return NextResponse.json({ classes: result });
}
