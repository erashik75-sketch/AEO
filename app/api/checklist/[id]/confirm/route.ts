import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = (await req.json()) as { confirmed?: boolean };

  const item = await prisma.checklistItem.findFirst({
    where: {
      id,
      checklistRun: {
        scan: { brand: { userId: session.user.id } },
      },
    },
  });

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.checklistItem.update({
    where: { id },
    data: {
      confirmedByUser: body.confirmed ?? true,
    },
  });

  return NextResponse.json(updated);
}
