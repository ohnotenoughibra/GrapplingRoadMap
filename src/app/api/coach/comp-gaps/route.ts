import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { CompetitionGap } from "@prisma/client";

export const dynamic = "force-dynamic";

interface GapEntry {
  positionSlug: string;
  categories: string[];
  notes?: string;
}

/**
 * POST /api/coach/comp-gaps — Save a competition gap analysis
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { date, name, notes, gaps } = body as {
      date: string;
      name?: string;
      notes?: string;
      gaps: GapEntry[];
    };

    if (!date || !gaps || gaps.length === 0) {
      return NextResponse.json(
        { error: "Date and at least one gap required" },
        { status: 400 }
      );
    }

    const record = await prisma.competitionGap.create({
      data: {
        coachId: userId,
        date: new Date(date),
        name: name || null,
        notes: notes || null,
        gaps: JSON.stringify(gaps),
      },
    });

    return NextResponse.json({ success: true, id: record.id });
  } catch (error) {
    console.error("Save comp gap error:", error);
    return NextResponse.json(
      { error: "Failed to save competition gap" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/coach/comp-gaps — Load recent competition gap analyses
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gaps = await prisma.competitionGap.findMany({
      where: { coachId: userId },
      orderBy: { date: "desc" },
      take: 20,
    });

    return NextResponse.json({
      gaps: gaps.map((g: CompetitionGap) => ({
        id: g.id,
        date: g.date.toISOString(),
        name: g.name,
        notes: g.notes,
        gaps: JSON.parse(g.gaps),
        createdAt: g.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Load comp gaps error:", error);
    return NextResponse.json({ error: "Failed to load gaps" }, { status: 500 });
  }
}
