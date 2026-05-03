import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="font-semibold text-zinc-900">
            AEO
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/dashboard/brands" className="text-zinc-600 hover:text-zinc-900">
              Brands
            </Link>
            <Link href="/dashboard/billing" className="text-zinc-600 hover:text-zinc-900">
              Billing
            </Link>
            <Link href="/dashboard/settings" className="text-zinc-600 hover:text-zinc-900">
              Settings
            </Link>
            <span className="text-zinc-400">|</span>
            <span className="text-zinc-500">{session?.user?.email}</span>
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
