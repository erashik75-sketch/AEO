import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ScanReportBody } from "@/components/scan/ScanReportBody";

export default async function ScanReportPage({
  params,
}: {
  params: { brandId: string; scanId: string };
}) {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const { brandId, scanId } = params;

  const scan = await prisma.scan.findFirst({
    where: {
      id: scanId,
      brandId,
      brand: { userId: session.user.id },
    },
    include: {
      brand: true,
      checklistRun: { include: { items: true } },
    },
  });

  if (!scan) notFound();

  const plan = await prisma.aEOPlan.findFirst({
    where: { scanId },
    include: { tasks: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <ScanReportBody
      scanId={scan.id}
      brandId={brandId}
      brandName={scan.brand.name ?? new URL(scan.brand.url).hostname}
      initial={{
        scan: {
          status: scan.status,
          summary: scan.summary,
          crossModelScore: scan.crossModelScore,
          probeContext: scan.probeContext,
          issues: scan.issues,
          claudeScores: scan.claudeScores,
          openaiScores: scan.openaiScores,
          perplexityScores: scan.perplexityScores,
          geminiScores: scan.geminiScores,
          modelFailures: scan.modelFailures,
          checklistRun: scan.checklistRun,
        },
        plan,
      }}
    />
  );
}
