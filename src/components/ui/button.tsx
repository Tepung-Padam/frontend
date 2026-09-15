import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Button({ className, variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" },) {
  return <button className={cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-50", { "bg-orange-500 text-white hover:bg-orange-600": variant === "primary", "border border-line bg-white text-ink hover:bg-paper": variant === "secondary", "text-ink hover:bg-paper": variant === "ghost" }, className)} {...props} />;
}
