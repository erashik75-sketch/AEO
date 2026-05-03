import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ScanTrendChart } from "@/components/scan/ScanTrendChart";
import { format } from "date-fns";

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

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {brand.name ?? new URL(brand.url).hostname}
          </h1>
          <p className="text-zinc-500">{brand.url}</p>
          <p className="mt-2 text-sm text-zinc-600">{brand.category}</p>
        </div>
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
            className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Run new scan
          </button>
        </form>
      </div>

      {chartData.length > 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="font-semibold">Score trend</h2>
          <ScanTrendChart data={chartData} />
        </div>
      ) : null}

      <div>
        <h2 className="font-semibold">Scan history</h2>
        <ul className="mt-4 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
          {(await prisma.scan.findMany({
            where: { brandId: brand.id },
            orderBy: { createdAt: "desc" },
            take: 20,
          })).map((sc) => (
            <li key={sc.id}>
              <Link
                href={`/dashboard/brands/${brand.id}/scans/${sc.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50"
              >
                <span className="text-sm">
                  {format(sc.createdAt, "PPp")} · {sc.status}
                </span>
                <span className="font-medium">
                  {sc.crossModelScore != null ? sc.crossModelScore : "—"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
