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
