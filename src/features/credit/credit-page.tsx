import { Link } from "react-router-dom";
import { FileClock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { EmptyState } from "@/components/feedback/empty-state";

export function CreditPage() { const query = useQuery({ queryKey: ["credit-applications"], queryFn: () => api.ownCreditApplications() }); if (query.isLoading) return <LoadingState />; if (query.isError) return <ErrorState message="Pengajuan simulasi belum dapat dimuat." onRetry={() => void query.refetch()} />; if (!query.data) return <ErrorState message="Data pengajuan kosong." onRetry={() => void query.refetch()} />; return <div className="space-y-6 pt-3"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Financing</p><h1 className="mt-2 font-display text-3xl font-bold">Progress pengajuan</h1><p className="mt-2 text-slate-500">Seluruh pengajuan di sini bersifat simulasi, bukan keputusan lending.</p></div>{query.data.items.length === 0 ? <EmptyState title="Belum ada pengajuan" detail="Pengajuan simulasi akan muncul setelah backend menyediakan alur pembuatan customer." /> : <div className="grid gap-4">{query.data.items.map((item) => <Link to={`/app/financing/${item.id}`} key={item.id}><Card className="p-5 transition hover:-translate-y-0.5"><div className="flex items-start justify-between gap-4"><div className="flex gap-3"><span className="rounded-xl bg-teal-50 p-3 text-teal-600"><FileClock size={21} /></span><div><h2 className="font-bold">{item.product_category.replaceAll("_", " ")}</h2><p className="mt-1 text-sm text-slate-500">Dibuat {formatDate(item.created_at)}</p></div></div><Badge tone="warning">SIMULATED</Badge></div><div className="mt-5 flex items-end justify-between"><p className="font-display text-xl font-bold">{formatCurrency(item.requested_amount, item.currency)}</p><span className="text-xs font-bold uppercase text-slate-500">{item.current_stage.replaceAll("_", " ")}</span></div></Card></Link>)}</div>}</div>; }
