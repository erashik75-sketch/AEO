import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";

export default async function BrandsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const brands = await prisma.brand.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Brands</h1>
        <Link
          href="/dashboard/brands/new"
          className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Add brand
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {brands.map((b) => (
          <Link key={b.id} href={`/dashboard/brands/${b.id}`}>
            <Card className="transition hover:border-zinc-400">
              <h2 className="font-semibold">{b.name ?? b.url}</h2>
              <p className="text-sm text-zinc-500">{b.category}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
