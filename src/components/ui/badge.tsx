import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Badge({ tone = "neutral", className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "success" | "warning" | "danger" }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold", { "bg-paper text-ink": tone === "neutral", "bg-emerald-50 text-emerald-700": tone === "success", "bg-amber-50 text-amber-700": tone === "warning", "bg-red-50 text-red-700": tone === "danger" }, className)} {...props} />;
}
