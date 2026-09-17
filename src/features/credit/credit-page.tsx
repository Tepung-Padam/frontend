import { Link, useLocation } from "react-router-dom";
import { FileClock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { codeLabel, formatCurrency, formatDate } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog } from "@/components/ui/dialog";

export function CreditPage() {
  const location = useLocation();

  const basePath = location.pathname.startsWith("/corporate")
    ? "/corporate/financing"
    : location.pathname.startsWith("/business")
      ? "/business/financing"
      : "/app/financing";

  const isConsumer = basePath === "/app/financing";
  const isCorporate = basePath === "/corporate/financing";

  const query = useQuery({
    queryKey: ["credit-applications", basePath],
    queryFn: () => api.ownCreditApplications(),
  });

  const [isCreating, setIsCreating] = useState(false);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(isConsumer ? "PERSONAL" : "WORKING_CAPITAL");
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: () => 
      api.createCreditApplication({
        product_category: category,
        requested_amount: amount,
        currency: "IDR",
        idempotency_key: crypto.randomUUID(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-applications", basePath] });
      setIsCreating(false);
      setAmount("");
    },
  });

  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) return <ErrorState message="Pengajuan simulasi belum dapat dimuat." onRetry={() => void query.refetch()} />;

  return (
    <div className="space-y-6 pt-3">
      <div className={`flex flex-col gap-5 rounded-3xl p-6 sm:flex-row sm:items-end sm:justify-between ${isCorporate ? "bg-[#17343b] text-white" : ""}`}>
        <div>
          <p className={`text-xs font-bold uppercase tracking-[0.18em] ${isCorporate ? "text-teal-200" : "text-orange-600"}`}>{isCorporate ? "Corporate financing" : "Financing"}</p>
          <h1 className="mt-2 font-display text-3xl font-bold">{isCorporate ? "Pengajuan perusahaan" : "Progress pengajuan"}</h1>
          <p className={`mt-2 ${isCorporate ? "text-slate-300" : "text-slate-500"}`}>{isCorporate ? "Pantau fasilitas, tahap review, dan dokumen perusahaan dalam satu ruang kerja." : "Seluruh pengajuan di sini bersifat simulasi, bukan keputusan lending."}</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} variant={isCreating ? "secondary" : "primary"}>
          {isCreating ? "Batal" : "Ajukan Simulasi"}
        </Button>
      </div>

      <Dialog open={isCreating} title="Pengajuan Simulasi Kredit" onClose={() => setIsCreating(false)}>
      {isCreating && (
        <Card className="p-5 bg-orange-50/50 border-orange-200">
          <h2 className="font-bold text-lg mb-4">Pengajuan Simulasi Kredit</h2>
          <div className="space-y-4 max-w-sm">
            <div>
              <label className="block text-sm font-medium mb-1">Kategori Produk</label>
              <select 
                className="w-full rounded-md border border-line bg-white p-2 text-sm"
                value={category}
                onChange={e => setCategory(e.target.value)}
                disabled={createMutation.isPending}
              >
                {isConsumer ? (
                  <option value="PERSONAL">Personal</option>
                ) : (
                  <>
                    <option value="WORKING_CAPITAL">Working Capital</option>
                    <option value="INVESTMENT">Investment</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Jumlah Pengajuan (IDR)</label>
              <input 
                type="number" 
                className="w-full rounded-md border border-line bg-white p-2 text-sm"
                placeholder="Misal: 5000000"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                disabled={createMutation.isPending}
              />
            </div>
            
            {createMutation.isError && (
              <p className="text-sm text-red-600 font-medium">Gagal mengajukan. Pastikan nominal valid.</p>
            )}

            <Button 
              className="w-full" 
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !amount}
            >
              {createMutation.isPending ? "Mengajukan..." : "Kirim Pengajuan"}
            </Button>
          </div>
        </Card>
      )}
      </Dialog>

      {query.data.items.length === 0 ? (
        <EmptyState title="Belum ada pengajuan" detail="Belum ada pengajuan simulasi yang tercatat untuk akun ini." />
      ) : (
        <div className="grid gap-4">
          {query.data.items.map((item) => (
            <Link to={`${basePath}/${item.id}`} key={item.id}>
              <Card className="p-5 transition hover:-translate-y-0.5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <span className="rounded-xl bg-teal-50 p-3 text-teal-600">
                      <FileClock size={21} />
                    </span>
                    <div>
                      <h2 className="font-bold">{codeLabel(item.product_category)}</h2>
                      <p className="mt-1 text-sm text-slate-500">Dibuat {formatDate(item.created_at)}</p>
                    </div>
                  </div>
                  <Badge tone="warning">SIMULATED</Badge>
                </div>

                <div className="mt-5 flex items-end justify-between">
                  <p className="font-display text-xl font-bold">
                    {formatCurrency(item.requested_amount, item.currency)}
                  </p>
                  <span className="text-xs font-bold uppercase text-slate-500">
                    {codeLabel(item.current_stage)}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
