import { Gift, Check, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { formatDate, codeLabel } from "@/lib/format";

export function OffersPage() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["offers"], queryFn: () => api.messages(1, 50) });
  const respond = useMutation({
    mutationFn: ({ id, event }: { id: string; event: "ACCEPTED" | "DECLINED" }) => api.respondToMessage(id, event, crypto.randomUUID()),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ["offers"] }); void queryClient.invalidateQueries({ queryKey: ["messages"] }); },
  });
  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) return <ErrorState message="Penawaran belum dapat dimuat." onRetry={() => void query.refetch()} />;
  const offers = query.data.items;
  return <div className="space-y-5"><header><p className="text-xs font-bold uppercase tracking-wider text-[#b14e14]">Spesial untuk Anda</p><h1 className="mt-2 text-2xl font-bold">Penawaran pilihan</h1><p className="mt-2 text-sm leading-6 text-[#667080]">Penawaran dikirim melalui backend sesuai profil dan aktivitas rekening.</p></header>{offers.length === 0 ? <EmptyState title="Belum ada penawaran" detail="Penawaran baru akan muncul setelah tersedia dari bank." /> : <div className="space-y-3">{offers.map((offer) => { const handled = offer.response_state === "ACCEPTED" || offer.response_state === "DECLINED"; return <Card key={offer.id} className="flex flex-col border-0 p-5 shadow-[0_5px_16px_rgba(27,44,73,0.09)]"><div className="flex items-start justify-between gap-3"><span className="rounded-xl bg-[#ffd9c5] p-3 text-[#a9470d]"><Gift size={20} /></span><Badge tone={offer.response_state === "ACCEPTED" ? "success" : offer.response_state === "DECLINED" ? "neutral" : "warning"}>{offer.response_state ? codeLabel(offer.response_state) : "Baru"}</Badge></div><h2 className="mt-4 text-lg font-bold">{offer.title}</h2><p className="mt-2 flex-1 text-sm leading-6 text-[#626a78]">{offer.body}</p><p className="mt-4 text-xs text-[#929aa8]">Diterima {formatDate(offer.created_at)}</p>{handled ? <p className="mt-4 rounded-xl bg-[#f0f1ff] p-3 text-sm font-semibold text-[#5f6877]">{offer.response_state === "ACCEPTED" ? "Penawaran diterima" : "Penawaran ditolak"}</p> : <div className="mt-4 flex gap-2"><Button variant="secondary" className="flex-1" disabled={respond.isPending} onClick={() => respond.mutate({ id: offer.id, event: "DECLINED" })}><X size={15} />Tolak</Button><Button className="flex-1" disabled={respond.isPending} onClick={() => respond.mutate({ id: offer.id, event: "ACCEPTED" })}><Check size={15} />Terima</Button></div>}</Card>; })}</div>}</div>;
}
