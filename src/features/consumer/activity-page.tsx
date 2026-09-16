import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { EmptyState } from "@/components/feedback/empty-state";

export function ActivityPage() { 
  const query = useQuery({ 
    queryKey: ["my-transactions"], 
    queryFn: () => api.meTransactions(),
  }); 
  
  if (query.isLoading) return <LoadingState />; 
  if (query.isError || !query.data) return <ErrorState message="Riwayat transaksi belum dapat dimuat." onRetry={() => void query.refetch()} />; 
  
  const items = query.data.items;
  
  return (
    <div className="space-y-6 pt-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Aktivitas</p>
        <h1 className="mt-2 font-display text-3xl font-bold">Riwayat transaksi</h1>
        <p className="mt-2 text-slate-500">Data ditampilkan dari endpoint customer yang diotorisasi backend.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Transaksi terbaru</CardTitle>
        </CardHeader>
        {items.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Belum ada transaksi" detail="Belum ada data transaksi untuk hubungan ini." />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="font-bold">{item.channel.replaceAll("_", " ")}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDate(item.transaction_timestamp)} · {item.data_source_type}
                  </p>
                </div>
                <p className={item.direction === "CREDIT" ? "font-bold text-teal-600" : "font-bold text-ink"}>
                  {item.direction === "CREDIT" ? "+" : "-"}
                  {formatCurrency(item.amount, item.currency)}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  ); 
}