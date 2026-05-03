import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { runAgent, type AgentId } from "@/lib/agents/runner";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ scanId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { scanId } = await ctx.params;
  const body = (await req.json()) as { agentId: AgentId; issueId?: string };

  const scan = await prisma.scan.findFirst({
    where: {
      id: scanId,
      brand: { userId: session.user.id },
    },
    include: { brand: { include: { user: true } } },
  });

  if (!scan) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const result = await runAgent({
      scanId,
      agentId: body.agentId,
      issueId: body.issueId,
      userPlan: scan.brand.user.plan,
    });
    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Agent failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
