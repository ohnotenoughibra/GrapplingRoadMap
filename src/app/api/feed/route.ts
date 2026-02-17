import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const posts = await prisma.feedPost.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ posts });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { type, content } = body;

  // For MVP, use first student
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
}
