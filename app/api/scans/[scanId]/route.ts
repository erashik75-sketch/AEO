import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ scanId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { scanId } = await ctx.params;

  const scan = await prisma.scan.findFirst({
    where: {
      id: scanId,
      brand: { userId: session.user.id },
    },
    include: {
      brand: true,
      checklistRun: { include: { items: true } },
      agentOutputs: true,
      chatMessages: { orderBy: { createdAt: "asc" } },
      deepDives: true,
    },
  });

  if (!scan) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const plan = await prisma.aEOPlan.findFirst({
    where: { scanId },
    include: { tasks: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ scan, plan });
}
