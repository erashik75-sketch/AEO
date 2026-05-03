"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Settings,
  Sparkles,
} from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/brands", label: "Brands", icon: Building2 },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({
  children,
  userEmail,
  plan,
}: {
  children: ReactNode;
  userEmail?: string | null;
  plan?: string;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200/80 bg-white shadow-soft lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-slate-100 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-sm">
            <Sparkles className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <Link href="/dashboard" className="font-semibold tracking-tight text-slate-900">
              AEO
            </Link>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Platform
            </p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          {nav.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-muted text-brand-dark shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0 opacity-90" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-100 p-4">
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <p className="truncate text-xs font-medium text-slate-900">{userEmail}</p>
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
              {plan ?? "FREE"} plan
            </p>
          </div>
          <SignOutButton className="mt-3 w-full justify-center rounded-xl border border-slate-200 bg-white py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50" />
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md lg:hidden">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            AEO
          </Link>
          <nav className="flex max-w-[55%] items-center gap-1 overflow-x-auto text-xs">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-lg px-2 py-1.5 text-slate-600 hover:bg-slate-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
