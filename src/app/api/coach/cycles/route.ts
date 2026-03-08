import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/coach/cycles — List all training cycles for the authenticated coach
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cycles = await prisma.trainingCycle.findMany({
      where: { coachId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { sessions: true } },
      },
    });

    return NextResponse.json({
      cycles: cycles.map((c) => ({
        id: c.id,
        name: c.name,
        weeks: c.weeks,
        classesPerWeek: c.classesPerWeek,
        classDuration: c.classDuration,
        focus: c.focus,
        source: c.source,
        sourceData: c.sourceData ? JSON.parse(c.sourceData) : null,
        startDate: c.startDate.toISOString(),
        endDate: c.endDate.toISOString(),
        status: c.status,
        notes: c.notes,
        createdAt: c.createdAt.toISOString(),
        sessionCount: c._count.sessions,
      })),
    });
  } catch (error) {
    console.error("List cycles error:", error);
    return NextResponse.json(
      { error: "Failed to load training cycles" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/coach/cycles — Create a new training cycle
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      weeks,
      classesPerWeek,
      classDuration,
      focus,
      source,
      sourceData,
      startDate,
      notes,
    } = body as {
      name: string;
      weeks: number;
      classesPerWeek: number;
      classDuration: number;
      focus: string;
      source?: string;
      sourceData?: any;
      startDate: string;
      notes?: string;
    };

    // Validation
    if (!name || !weeks || !classesPerWeek || !classDuration || !focus || !startDate) {
      return NextResponse.json(
        { error: "Missing required fields: name, weeks, classesPerWeek, classDuration, focus, startDate" },
        { status: 400 }
      );
    }

    if (weeks < 1 || weeks > 16) {
      return NextResponse.json(
        { error: "Weeks must be between 1 and 16" },
        { status: 400 }
      );
    }

    if (classesPerWeek < 1 || classesPerWeek > 7) {
      return NextResponse.json(
        { error: "Classes per week must be between 1 and 7" },
        { status: 400 }
      );
    }

    if (classDuration < 30 || classDuration > 180) {
      return NextResponse.json(
        { error: "Class duration must be between 30 and 180 minutes" },
        { status: 400 }
      );
    }

    // Auto-calculate endDate
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + weeks * 7);

    const cycle = await prisma.trainingCycle.create({
      data: {
        coachId: userId,
        name,
        weeks,
        classesPerWeek,
        classDuration,
        focus,
        source: source || null,
        sourceData: sourceData ? JSON.stringify(sourceData) : null,
        startDate: start,
        endDate: end,
        notes: notes || null,
      },
    });

    return NextResponse.json({ success: true, id: cycle.id, cycle });
  } catch (error) {
    console.error("Create cycle error:", error);
    return NextResponse.json(
      { error: "Failed to create training cycle" },
      { status: 500 }
    );
  }
}
