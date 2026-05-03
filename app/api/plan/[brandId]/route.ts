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
  });
  if (!brand) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const plan = await prisma.aEOPlan.findFirst({
    where: { brandId },
    include: { tasks: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(plan);
}
