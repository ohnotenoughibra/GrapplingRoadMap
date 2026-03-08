import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/coach/cycles/[id] — Get a single cycle with all its sessions
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cycle = await prisma.trainingCycle.findFirst({
      where: { id: params.id, coachId: userId },
      include: {
        sessions: {
          include: {
            techniques: {
              include: {
                technique: { select: { id: true, name: true, slug: true, category: true } },
              },
            },
          },
          orderBy: [{ weekNumber: "asc" }, { dayNumber: "asc" }, { date: "asc" }],
        },
      },
    });

    if (!cycle) {
      return NextResponse.json({ error: "Cycle not found" }, { status: 404 });
    }

    return NextResponse.json({
      cycle: {
        id: cycle.id,
        name: cycle.name,
        weeks: cycle.weeks,
        classesPerWeek: cycle.classesPerWeek,
        classDuration: cycle.classDuration,
        focus: cycle.focus,
        source: cycle.source,
        sourceData: cycle.sourceData ? JSON.parse(cycle.sourceData) : null,
        startDate: cycle.startDate.toISOString(),
        endDate: cycle.endDate.toISOString(),
        status: cycle.status,
        notes: cycle.notes,
        createdAt: cycle.createdAt.toISOString(),
        sessions: cycle.sessions.map((s) => ({
          id: s.id,
          date: s.date.toISOString(),
          discipline: s.discipline,
          title: s.title,
          notes: s.notes,
          scheduledDate: s.scheduledDate?.toISOString() || null,
          duration: s.duration,
          weekNumber: s.weekNumber,
          dayNumber: s.dayNumber,
          techniques: s.techniques.map((t) => ({
            id: t.technique.id,
            name: t.technique.name,
            slug: t.technique.slug,
            category: t.technique.category,
            notes: t.notes,
          })),
        })),
      },
    });
  } catch (error) {
    console.error("Get cycle error:", error);
    return NextResponse.json(
      { error: "Failed to load training cycle" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/coach/cycles/[id] — Update a cycle (status, notes, name)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const existing = await prisma.trainingCycle.findFirst({
      where: { id: params.id, coachId: userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Cycle not found" }, { status: 404 });
    }

    const body = await request.json();
    const { status, notes, name } = body as {
      status?: string;
      notes?: string;
      name?: string;
    };

    const data: Record<string, any> = {};
    if (status !== undefined) data.status = status;
    if (notes !== undefined) data.notes = notes;
    if (name !== undefined) data.name = name;

    const updated = await prisma.trainingCycle.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ success: true, cycle: updated });
  } catch (error) {
    console.error("Update cycle error:", error);
    return NextResponse.json(
      { error: "Failed to update training cycle" },
      { status: 500 }
    );
  }
}
