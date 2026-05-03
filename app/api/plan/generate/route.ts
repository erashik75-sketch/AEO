import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildPlanPrompt } from "@/lib/prompts/analysis";
import { callAnalysisLlm } from "@/lib/ai/llm-router";
import { parseJsonObject } from "@/lib/json";
import type { Issue } from "@/types";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { scanId?: string };
  if (!body.scanId) {
    return NextResponse.json({ error: "scanId required" }, { status: 400 });
  }

  const scan = await prisma.scan.findFirst({
    where: {
      id: body.scanId,
      brand: { userId: session.user.id },
    },
    include: {
      brand: true,
      checklistRun: { include: { items: true } },
    },
  });

  if (!scan || scan.status !== "COMPLETE") {
    return NextResponse.json({ error: "Scan not ready" }, { status: 400 });
  }

  const issues = (scan.issues as unknown as Issue[]) ?? [];
  const checklistFailures =
    scan.checklistRun?.items.filter((i) => i.status === "fail") ?? [];

  const scores = {
    claude: (scan.claudeScores as { overall?: number })?.overall ?? 0,
    openai: (scan.openaiScores as { overall?: number })?.overall,
    perplexity: (scan.perplexityScores as { overall?: number })?.overall,
    gemini: (scan.geminiScores as { overall?: number })?.overall,
  };

  const planPrompt = buildPlanPrompt({
    brand: scan.brand.name ?? scan.brand.url,
    category: scan.brand.category,
    crossModelScore: scan.crossModelScore ?? 0,
    modelScores: Object.fromEntries(
      Object.entries(scores).filter(([, v]) => v != null)
    ) as Record<string, number>,
    issues,
    checklistFailures,
    competitors: scan.brand.competitors ?? "",
  });

  let planPayload: Record<string, unknown>;
  try {
    const raw = await callAnalysisLlm(planPrompt);
    planPayload = parseJsonObject<Record<string, unknown>>(raw);
  } catch {
    return NextResponse.json({ error: "Plan generation failed" }, { status: 500 });
  }

  type TaskShape = {
    title: string;
    owner: string;
    signalImproved: string;
    agentId?: string;
  };

  const tasks: {
    title: string;
    owner: string;
    phase: number;
    type: string;
    signalImproved: string;
    agentId?: string;
  }[] = [];

  const push = (phase: number, bucket: { tasks?: TaskShape[] } | undefined) => {
    for (const t of bucket?.tasks ?? []) {
      tasks.push({
        title: t.title,
        owner: t.owner ?? "founder",
        phase,
        type: "one-time",
        signalImproved: t.signalImproved ?? "mixed",
        agentId: t.agentId,
      });
    }
  };

  push(30, planPayload.phase30 as { tasks?: TaskShape[] });
  push(60, planPayload.phase60 as { tasks?: TaskShape[] });
  push(90, planPayload.phase90 as { tasks?: TaskShape[] });

  await prisma.aEOPlan.deleteMany({
    where: { brandId: scan.brand.id, scanId: scan.id },
  });

  const plan = await prisma.aEOPlan.create({
    data: {
      brandId: scan.brand.id,
      scanId: scan.id,
      summary: planPayload as object,
      tasks: { create: tasks },
    },
    include: { tasks: true },
  });

  return NextResponse.json(plan);
}
