import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}) {
  const variants = {
    primary:
      "bg-brand text-brand-foreground shadow-sm hover:bg-brand-dark focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
    secondary:
      "bg-slate-900 text-white shadow-sm hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
    outline:
      "border border-slate-200 bg-white text-slate-800 shadow-sm hover:border-slate-300 hover:bg-slate-50",
    ghost: "text-slate-700 hover:bg-slate-100",
  };
  const sizes = {
    sm: "rounded-lg px-3 py-1.5 text-xs font-semibold",
    md: "rounded-xl px-4 py-2.5 text-sm font-semibold",
    lg: "rounded-xl px-6 py-3 text-sm font-semibold",
  };

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center transition-colors disabled:pointer-events-none disabled:opacity-45",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
