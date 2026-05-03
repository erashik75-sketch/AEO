import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { maxBrands, maxScansPerMonth } from "@/lib/plans";
import { Card } from "@/components/ui/card";

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
        <p className="mt-2 text-zinc-600">
          Plan: <span className="font-medium">{user?.plan}</span> · Scans this month:{" "}
          <span className="font-medium">
            {scansUsed}/{scanLimit === 999 ? "∞" : scanLimit}
          </span>{" "}
          · Brands:{" "}
          <span className="font-medium">
            {brands.length}/{brandLimit === 999 ? "∞" : brandLimit}
          </span>
        </p>
      </div>

      {brands.length === 0 ? (
        <Card>
          <p className="text-zinc-700">Add your first brand to run a diagnostic scan.</p>
          <Link
            href="/dashboard/brands/new"
            className="mt-4 inline-block rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Add your first brand
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {brands.map((b) => {
            const latest = b.scans[0];
            return (
              <Link key={b.id} href={`/dashboard/brands/${b.id}`}>
                <Card className="transition hover:border-zinc-400">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="font-semibold text-zinc-900">
                        {b.name ?? new URL(b.url).hostname}
                      </h2>
                      <p className="mt-1 text-sm text-zinc-500">{b.url}</p>
                    </div>
                    {latest?.crossModelScore != null ? (
                      <span className="rounded-full bg-zinc-900 px-3 py-1 text-sm font-semibold text-white">
                        {latest.crossModelScore}
                      </span>
                    ) : (
                      <span className="text-xs uppercase text-zinc-400">
                        {latest?.status ?? "no scans"}
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
