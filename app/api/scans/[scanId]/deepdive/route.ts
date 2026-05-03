import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildDeepDivePrompt } from "@/lib/prompts/deepdive";
import type { DeepDiveTab } from "@/lib/prompts/deepdive";
import { callAnalysisLlm } from "@/lib/ai/llm-router";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ scanId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { scanId } = await ctx.params;
  const body = (await req.json()) as {
    issueId: string;
    tab: DeepDiveTab;
  };

  const scan = await prisma.scan.findFirst({
    where: {
      id: scanId,
      brand: { userId: session.user.id },
    },
    include: { brand: true },
  });

  if (!scan || scan.status !== "COMPLETE") {
    return NextResponse.json({ error: "Scan not ready" }, { status: 400 });
  }

  const existing = await prisma.deepDive.findUnique({
    where: {
      scanId_issueId_tab: {
        scanId,
        issueId: body.issueId,
        tab: body.tab,
      },
    },
  });

  if (existing) {
    return NextResponse.json({ content: existing.content, cached: true });
  }

  const brandRef = scan.brand.name ?? new URL(scan.brand.url).hostname;
  const issues = (scan.issues as { id?: string; title?: string; brief?: string }[]) ?? [];
  const issue = issues.find((i) => i.id === body.issueId);

  const prompt = buildDeepDivePrompt({
    tab: body.tab,
    brandRef,
    url: scan.brand.url,
    category: scan.brand.category,
    issueTitle: issue?.title ?? "Issue",
    issueBrief: issue?.brief ?? "",
    probeContext: scan.probeContext ?? "",
  });

  const content = await callAnalysisLlm(prompt);

  await prisma.deepDive.create({
    data: {
      scanId,
      issueId: body.issueId,
      tab: body.tab,
      content,
    },
  });

  return NextResponse.json({ content, cached: false });
}
