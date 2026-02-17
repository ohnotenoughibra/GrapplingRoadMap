import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const templates = await prisma.classTemplate.findMany({
      include: {
        techniques: { include: { technique: { include: { position: true } } } },
        _count: { select: { classes: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ templates });
  } catch {
    return NextResponse.json({ templates: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, discipline, warmup, notes, techniqueIds } = await request.json();

    if (!name || !discipline) {
      return NextResponse.json({ error: "name and discipline required" }, { status: 400 });
    }

    const template = await prisma.classTemplate.create({
      data: {
        name,
        discipline,
        warmup: warmup || null,
        notes: notes || null,
        techniques: {
          create: (techniqueIds || []).map((id: string) => ({ techniqueId: id })),
        },
      },
      include: { techniques: { include: { technique: true } } },
    });

    return NextResponse.json(template, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    await prisma.classTemplate.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
  }
}
