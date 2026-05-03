"use client";

import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center text-sm font-medium text-slate-600 transition-colors hover:text-slate-900",
        className
      )}
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Sign out
    </button>
  );
}
