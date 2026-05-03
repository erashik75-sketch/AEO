import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ScanTrendChart } from "@/components/scan/ScanTrendChart";
import { format } from "date-fns";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { ExternalLink, Play } from "lucide-react";

export default async function BrandPage({
  params,
}: {
  params: { brandId: string };
}) {
  const session = await auth();
  const { brandId } = params;
  if (!session?.user?.id) notFound();

  const brand = await prisma.brand.findFirst({
    where: { id: brandId, userId: session.user.id },
    include: {
      scans: {
        orderBy: { createdAt: "asc" },
        where: { status: "COMPLETE", crossModelScore: { not: null } },
        select: { createdAt: true, crossModelScore: true },
      },
    },
  });

  if (!brand) notFound();

  const chartData = brand.scans.map((s) => ({
    date: format(s.createdAt, "MMM d"),
    score: s.crossModelScore,
  }));

  const scans = await prisma.scan.findMany({
    where: { brandId: brand.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const displayName = brand.name ?? new URL(brand.url).hostname;

  return (
    <div>
      <PageHeader
        title={displayName}
        description={
          <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
            <a
              href={brand.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-brand-dark hover:underline"
            >
              {brand.url}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <span className="text-slate-400">·</span>
            <span>{brand.category}</span>
          </span>
        }
        actions={
          <form
            action={async () => {
              "use server";
              const { auth } = await import("@/auth");
              const { prisma } = await import("@/lib/prisma");
              const { canRunScan } = await import("@/lib/quotas");
              const { executeScan } = await import("@/lib/scan/orchestrator");
              const s = await auth();
              if (!s?.user?.id) return;
              if (!(await canRunScan(s.user.id))) return;
              const b = await prisma.brand.findFirst({
                where: { id: brandId, userId: s.user.id },
              });
              if (!b) return;
              const scan = await prisma.scan.create({
                data: { brandId: b.id, status: "RUNNING" },
              });
              await prisma.user.update({
                where: { id: s.user.id },
                data: { scansThisMonth: { increment: 1 } },
              });
              executeScan(scan.id).catch(console.error);
            }}
          >
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark"
            >
              <Play className="h-4 w-4 fill-current" />
              Run new scan
            </button>
          </form>
        }
      />

      {chartData.length > 0 ? (
        <Card className="mb-10 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Cross-model score trend
          </h2>
          <div className="mt-6">
            <ScanTrendChart data={chartData} />
          </div>
        </Card>
      ) : null}

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Scan history
        </h2>
        <Card className="mt-4 divide-y divide-slate-100 overflow-hidden p-0">
          {scans.map((sc) => (
            <Link
              key={sc.id}
              href={`/dashboard/brands/${brand.id}/scans/${sc.id}`}
              className="flex items-center justify-between px-5 py-4 transition hover:bg-slate-50"
            >
              <span className="text-sm text-slate-700">{format(sc.createdAt, "PPp")}</span>
              <span className="flex items-center gap-3">
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium uppercase text-slate-600">
                  {sc.status}
                </span>
                <span className="min-w-[2.5rem] text-right font-semibold tabular-nums text-slate-900">
                  {sc.crossModelScore != null ? sc.crossModelScore : "—"}
                </span>
              </span>
            </Link>
          ))}
        </Card>
      </div>
    </div>
  );
}
