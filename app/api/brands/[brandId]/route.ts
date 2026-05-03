import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ brandId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { brandId } = await ctx.params;

  const brand = await prisma.brand.findFirst({
    where: { id: brandId, userId: session.user.id },
    include: {
      scans: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          crossModelScore: true,
          createdAt: true,
        },
      },
    },
  });

  if (!brand) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(brand);
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ brandId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { brandId } = await ctx.params;
  const body = await req.json();

  const existing = await prisma.brand.findFirst({
    where: { id: brandId, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.brand.update({
    where: { id: brandId },
    data: {
      name: body.name ?? undefined,
      url: body.url ?? undefined,
      category: body.category ?? undefined,
      competitors: body.competitors ?? undefined,
      description: body.description ?? undefined,
      useCases: body.useCases ?? undefined,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ brandId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { brandId } = await ctx.params;

  const existing = await prisma.brand.findFirst({
    where: { id: brandId, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.brand.delete({ where: { id: brandId } });
  return NextResponse.json({ ok: true });
}
