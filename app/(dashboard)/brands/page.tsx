import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Plus } from "lucide-react";

export default async function BrandsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const brands = await prisma.brand.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Brands"
        description="Each brand gets its own scan history, checklist, and execution plan."
        actions={
          <Link
            href="/dashboard/brands/new"
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark"
          >
            <Plus className="h-4 w-4" />
            Add brand
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        {brands.map((b) => (
          <Link key={b.id} href={`/dashboard/brands/${b.id}`} className="group block">
            <Card className="h-full p-5 transition group-hover:border-brand/25 group-hover:shadow-soft">
              <h2 className="font-semibold text-slate-900 group-hover:text-brand-dark">
                {b.name ?? b.url}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{b.category}</p>
              <p className="mt-3 truncate text-xs text-slate-400">{b.url}</p>
            </Card>
          </Link>
        ))}
      </div>

      {brands.length === 0 ? (
        <Card className="border-dashed border-slate-300 bg-slate-50/80 p-12 text-center">
          <p className="text-slate-600">No brands yet. Add one to run your first scan.</p>
          <Link
            href="/dashboard/brands/new"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            Add brand
          </Link>
        </Card>
      ) : null}
    </div>
  );
}
