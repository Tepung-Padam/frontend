import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Badge({ tone = "neutral", className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "success" | "warning" | "danger" | "info" | "unavailable" }) {
  return <span className={cn("inline-flex items-center rounded-md px-2 py-1 text-[11px] font-bold leading-none", { "bg-slate-100 text-slate-700": tone === "neutral", "bg-emerald-50 text-emerald-700": tone === "success", "bg-amber-50 text-amber-800": tone === "warning", "bg-red-50 text-red-700": tone === "danger", "bg-teal-50 text-teal-700": tone === "info", "bg-slate-100 text-slate-500": tone === "unavailable" }, className)} {...props} />;
}
