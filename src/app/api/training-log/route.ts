import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    let userId: string;

    if (user) {
      userId = user.id;
    } else {
      const student = await prisma.user.findFirst({ where: { role: "student" } });
      if (!student) return NextResponse.json({ logs: [] });
      userId = student.id;
    }

    const logs = await prisma.trainingLog.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 50,
    });

    return NextResponse.json({ logs });
  } catch {
    return NextResponse.json({ logs: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    let userId: string;

    if (user) {
      userId = user.id;
    } else {
      const student = await prisma.user.findFirst({ where: { role: "student" } });
      if (!student) return NextResponse.json({ error: "No user" }, { status: 401 });
      userId = student.id;
    }

    const { title, content, mood, energy, tags } = await request.json();

    if (!content) {
      return NextResponse.json({ error: "content required" }, { status: 400 });
    }

    const log = await prisma.trainingLog.create({
      data: {
        userId,
        title: title || null,
        content,
        mood: mood || null,
        energy: energy || null,
        tags: tags ? JSON.stringify(tags) : null,
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create log" }, { status: 500 });
  }
}
