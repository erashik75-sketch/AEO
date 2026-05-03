import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { maxBrands, maxScansPerMonth } from "@/lib/plans";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Gauge, Layers } from "lucide-react";

export default async function DashboardHome() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      brands: {
        include: {
          scans: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { crossModelScore: true, status: true },
          },
        },
      },
    },
  });

  const brands = user?.brands ?? [];
  const scansUsed = user?.scansThisMonth ?? 0;
  const scanLimit = maxScansPerMonth(user?.plan ?? "FREE");
  const brandLimit = maxBrands(user?.plan ?? "FREE");

  const scanLabel = scanLimit === 999 ? "∞" : String(scanLimit);
  const brandLabel = brandLimit === 999 ? "∞" : String(brandLimit);

  return (
    <div>
      <PageHeader
        title="Overview"
        description="Monitor brands, scan usage, and jump back into diagnostics."
      />

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <Card className="relative overflow-hidden p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Plan
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{user?.plan}</p>
            </div>
            <span className="rounded-xl bg-brand-muted p-2 text-brand-dark">
              <Layers className="h-5 w-5" />
            </span>
          </div>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Scans this month
          </p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">
            {scansUsed}
            <span className="text-slate-400"> / {scanLabel}</span>
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Brands
          </p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">
            {brands.length}
            <span className="text-slate-400"> / {brandLabel}</span>
          </p>
        </Card>
      </div>

      {brands.length === 0 ? (
        <Card className="border-dashed border-slate-300 bg-slate-50/50 p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-muted text-brand-dark">
            <Gauge className="h-7 w-7" />
          </div>
          <h2 className="mt-6 text-lg font-semibold text-slate-900">Add your first brand</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
            Run a diagnostic across AI models, get scores for five AEO signals, and receive a
            prioritized execution plan.
          </p>
          <Link
            href="/dashboard/brands/new"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-md shadow-teal-900/10 transition hover:bg-brand-dark"
          >
            Add brand
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {brands.map((b) => {
            const latest = b.scans[0];
            const score = latest?.crossModelScore;
            return (
              <Link key={b.id} href={`/dashboard/brands/${b.id}`} className="group block">
                <Card className="h-full p-5 transition group-hover:border-brand/30 group-hover:shadow-soft">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="truncate font-semibold text-slate-900 group-hover:text-brand-dark">
                        {b.name ?? new URL(b.url).hostname}
                      </h2>
                      <p className="mt-1 truncate text-sm text-slate-500">{b.url}</p>
                    </div>
                    {score != null ? (
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-lg font-bold text-white shadow-md">
                        {score}
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                        {latest?.status ?? "idle"}
                      </span>
                    )}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
