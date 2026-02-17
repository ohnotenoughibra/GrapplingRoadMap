import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const posts = await prisma.feedPost.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ posts: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, content } = body;

    let user = await prisma.user.findFirst({ where: { role: "student" } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: "Student",
          email: "student@rootscollective.com",
          role: "student",
        },
      });
    }

    const post = await prisma.feedPost.create({
      data: {
        type: type || "checkin",
        content,
        userId: user.id,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create post. Is the database connected?" }, { status: 500 });
  }
}
