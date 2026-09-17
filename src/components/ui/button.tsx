import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Button({ className, variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" },) {
  return <button className={cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", { "bg-orange-500 text-white hover:bg-orange-600": variant === "primary", "border border-line bg-white text-ink hover:border-slate-300 hover:bg-slate-50": variant === "secondary", "text-slate-600 hover:bg-slate-100 hover:text-ink": variant === "ghost" }, className)} {...props} />;
}
