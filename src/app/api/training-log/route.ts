import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ logs: [] });

    const logs = await prisma.trainingLog.findMany({
      where: { userId: user.id },
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
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const { title, content, mood, energy, tags } = await request.json();

    if (!content) {
      return NextResponse.json({ error: "content required" }, { status: 400 });
    }

    const log = await prisma.trainingLog.create({
      data: {
        userId: user.id,
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
