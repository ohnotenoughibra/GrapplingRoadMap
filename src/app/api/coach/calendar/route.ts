import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/coach/calendar?month=2026-03
 * Returns all ClassSessions for that month (by date field),
 * plus any scheduled-but-unlogged sessions from active cycles.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const month = request.nextUrl.searchParams.get("month");
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { error: "Invalid month format. Use YYYY-MM (e.g. 2026-03)" },
        { status: 400 }
      );
    }

    const [year, mon] = month.split("-").map(Number);
    const startOfMonth = new Date(year, mon - 1, 1);
    const endOfMonth = new Date(year, mon, 1); // first day of next month

    // Logged class sessions in this month
    const loggedSessions = await prisma.classSession.findMany({
      where: {
        coachId: userId,
        date: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
      },
      include: {
        techniques: {
          include: {
            technique: { select: { id: true, name: true, slug: true, category: true } },
          },
        },
        cycle: { select: { id: true, name: true } },
      },
      orderBy: { date: "asc" },
    });

    // Scheduled-but-unlogged sessions from active cycles (by scheduledDate)
    const scheduledSessions = await prisma.classSession.findMany({
      where: {
        coachId: userId,
        scheduledDate: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
        // Only include sessions that don't have a logged date in this month
        // (avoid duplicates with loggedSessions)
        OR: [
          { date: { lt: startOfMonth } },
          { date: { gte: endOfMonth } },
        ],
        cycle: { status: "active" },
      },
      include: {
        techniques: {
          include: {
            technique: { select: { id: true, name: true, slug: true, category: true } },
          },
        },
        cycle: { select: { id: true, name: true } },
      },
      orderBy: { scheduledDate: "asc" },
    });

    const formatSession = (s: any) => ({
      id: s.id,
      date: s.date.toISOString(),
      scheduledDate: s.scheduledDate?.toISOString() || null,
      discipline: s.discipline,
      title: s.title,
      notes: s.notes,
      weekNumber: s.weekNumber,
      dayNumber: s.dayNumber,
      duration: s.duration,
      cycle: s.cycle ? { id: s.cycle.id, name: s.cycle.name } : null,
      techniques: s.techniques.map((t: any) => ({
        id: t.technique.id,
        name: t.technique.name,
        slug: t.technique.slug,
        category: t.technique.category,
        notes: t.notes,
      })),
    });

    return NextResponse.json({
      month,
      sessions: loggedSessions.map(formatSession),
      scheduled: scheduledSessions.map(formatSession),
    });
  } catch (error) {
    console.error("Calendar error:", error);
    return NextResponse.json(
      { error: "Failed to load calendar" },
      { status: 500 }
    );
  }
}
