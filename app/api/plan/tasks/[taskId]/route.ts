import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ taskId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { taskId } = await ctx.params;
  const body = (await req.json()) as { status?: string };

  const task = await prisma.planTask.findFirst({
    where: {
      id: taskId,
      plan: { brand: { userId: session.user.id } },
    },
  });

  if (!task) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.planTask.update({
    where: { id: taskId },
    data: {
      status: body.status ?? task.status,
      completedAt:
        body.status === "done" ? new Date() : task.completedAt,
    },
  });

  return NextResponse.json(updated);
}
