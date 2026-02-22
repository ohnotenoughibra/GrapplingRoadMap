import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const discipline = request.nextUrl.searchParams.get("discipline") || "all";

    const currentUser = await getCurrentUser();
    const studentId = currentUser?.id;

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
  } catch {
    return NextResponse.json({ classes: [] });
  }
}
