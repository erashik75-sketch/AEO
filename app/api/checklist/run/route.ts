import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { crawlForTechnicalAudit, fetchHomepageHtml } from "@/lib/checklist/crawl";
import { extractWebsiteCopyFromHtml, runChecklistAuto } from "@/lib/checklist/runner";

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
    include: { brand: true },
  });

  if (!scan) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.checklistRun.deleteMany({ where: { scanId: scan.id } });

  const crawl = await crawlForTechnicalAudit(scan.brand.url);
  const homepageHtml = await fetchHomepageHtml(scan.brand.url);
  const snippet =
    homepageHtml.length > crawl.homepageSnippet.length
      ? extractWebsiteCopyFromHtml(homepageHtml)
      : crawl.homepageSnippet;

  const checklist = await runChecklistAuto({
    brandUrl: scan.brand.url,
    category: scan.brand.category,
    crawl: { ...crawl, homepageSnippet: snippet },
  });

  const run = await prisma.checklistRun.create({
    data: {
      scanId: scan.id,
      brandId: scan.brand.id,
      overallScore: checklist.overallScore,
      categoryScores: checklist.categoryScores as object,
      items: {
        create: checklist.items.map((it) => ({
          checkId: it.checkId,
          category: it.category,
          name: it.name,
          status: it.status,
          aeoImpact: it.aeoImpact,
          fixAgentId: it.fixAgentId,
          detail: it.detail,
        })),
      },
    },
    include: { items: true },
  });

  return NextResponse.json(run);
}
