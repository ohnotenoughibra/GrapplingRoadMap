import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const slug = url.searchParams.get("slug");

    // Single technique detail view
    if (slug) {
      const session = await getServerSession(authOptions);
      const userId = (session?.user as any)?.id as string | undefined;

      const technique = await prisma.technique.findUnique({
        where: { slug },
        include: {
          position: true,
          studentSkills: userId
            ? { where: { userId }, select: { level: true, updatedAt: true } }
            : false,
          classItems: {
            include: {
              classSession: {
                select: { date: true, title: true },
              },
            },
            orderBy: { classSession: { date: "desc" } },
            take: 5,
          },
        },
      });

      if (!technique) {
        return NextResponse.json({ technique: null });
      }

      // Find related techniques (same position, same category)
      const related = await prisma.technique.findMany({
        where: {
          positionId: technique.positionId,
          id: { not: technique.id },
        },
        select: { id: true, name: true, slug: true, category: true },
        take: 6,
      });

      const skill = technique.studentSkills && technique.studentSkills.length > 0
        ? technique.studentSkills[0]
        : null;

      return NextResponse.json({
        technique: {
          id: technique.id,
          name: technique.name,
          slug: technique.slug,
          description: technique.description,
          discipline: technique.discipline,
          category: technique.category,
          difficulty: technique.difficulty,
          videoUrl: technique.videoUrl,
          position: technique.position,
          skill,
          relatedTechniques: related,
          classHistory: technique.classItems.map((ci) => ({
            date: ci.classSession.date,
            title: ci.classSession.title,
          })),
        },
      });
    }

    // Full list view (existing behavior)
    const [techniques, positions] = await Promise.all([
      prisma.technique.findMany({
        include: { position: true },
        orderBy: [{ position: { sortOrder: "asc" } }, { sortOrder: "asc" }],
      }),
      prisma.position.findMany({
        orderBy: { sortOrder: "asc" },
      }),
    ]);

    return NextResponse.json({ techniques, positions });
  } catch {
    return NextResponse.json({ techniques: [], positions: [] });
  }
}

// POST: Add a new custom technique
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, positionSlug, category, discipline, difficulty, summary, tips, commonMistakes, transitionTarget } = body;

    if (!name?.trim() || !positionSlug || !category || !discipline || !difficulty) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const position = await prisma.position.findUnique({ where: { slug: positionSlug } });
    if (!position) {
      return NextResponse.json({ error: `Position not found` }, { status: 404 });
    }

    const slug = `${positionSlug}-${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;

    const existing = await prisma.technique.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "A technique with this name already exists for this position" }, { status: 409 });
    }

    const technique = await prisma.technique.create({
      data: {
        name: name.trim(),
        slug,
        positionId: position.id,
        category,
        discipline,
        difficulty,
        summary: summary?.trim() || null,
        tips: Array.isArray(tips) ? tips.filter((t: string) => t.trim()) : [],
        commonMistakes: Array.isArray(commonMistakes) ? commonMistakes.filter((m: string) => m.trim()) : [],
        transitionTarget: transitionTarget || null,
        isCustom: true,
        createdBy: (session.user as any).id,
      },
      include: { position: { select: { slug: true, name: true } } },
    });

    return NextResponse.json({ technique }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create technique" }, { status: 500 });
  }
}
