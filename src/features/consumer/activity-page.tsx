import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { codeLabel, formatCurrency, formatDate } from "@/lib/format";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { EmptyState } from "@/components/feedback/empty-state";

export function ActivityPage() {
  const query = useQuery({ queryKey: ["my-transactions"], queryFn: () => api.meTransactions() });
  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) return <ErrorState message="Riwayat transaksi belum dapat dimuat." onRetry={() => void query.refetch()} />;
  const groups = Object.entries(query.data.items.reduce<Record<string, typeof query.data.items>>((result, item) => { const key = formatDate(item.transaction_timestamp); (result[key] ??= []).push(item); return result; }, {}));
  return <div className="space-y-7"><header><p className="text-xs font-semibold uppercase tracking-wider text-orange-600">Aktivitas</p><h1 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Riwayat transaksi</h1><p className="mt-2 text-sm text-slate-500">Mutasi terbaru dari rekening yang terhubung dengan profil Anda.</p></header>{groups.length === 0 ? <EmptyState title="Belum ada transaksi" detail="Aktivitas rekening akan muncul di sini setelah tersedia." /> : <div className="space-y-7">{groups.map(([date, items]) => <section key={date}><h2 className="mb-2 text-xs font-semibold text-slate-500">{date}</h2><div className="divide-y divide-line border-y border-line">{items?.map((item) => <div key={item.id} className="flex items-center gap-3 py-4"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${item.direction === "CREDIT" ? "bg-teal-50 text-teal-700" : "bg-slate-100 text-slate-600"}`}>{item.direction === "CREDIT" ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{item.description_normalized || codeLabel(item.channel)}</p><p className="mt-0.5 text-xs text-slate-500">{codeLabel(item.channel)} | {new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }).format(new Date(item.transaction_timestamp))}</p></div><p className={`whitespace-nowrap text-sm font-semibold tabular-nums ${item.direction === "CREDIT" ? "text-teal-700" : "text-ink"}`}>{item.direction === "CREDIT" ? "+" : "−"}{formatCurrency(item.amount, item.currency)}</p></div>)}</div></section>)}</div>}</div>;
}
