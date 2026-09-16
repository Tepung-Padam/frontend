import { ArrowUpRight, CalendarDays, ChevronRight, MessageCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { formatCurrency } from "@/lib/format";

export function ConsumerHomePage() {
  const summary = useQuery({ 
    queryKey: ["my-summary"], 
    queryFn: () => api.meSummary() 
  });

  if (summary.isLoading) return <LoadingState />;
  if (summary.isError || !summary.data) return <ErrorState message="Ringkasan data belum dapat dimuat." onRetry={() => void summary.refetch()} />;
  
  const data = summary.data;
  
  return (
    <div className="space-y-6 pt-3">
      <section className="relative overflow-hidden rounded-3xl bg-[#202d35] p-7 text-white shadow-soft sm:p-10">
        <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full border-[34px] border-orange-400/20" />
        <p className="text-sm text-slate-300">Selamat datang kembali</p>
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{data.customer_ref}</h1>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Primary relationship</p>
            <p className="mt-2 text-2xl font-bold">{data.accounts.length} rekening</p>
          </div>
          <Badge tone="success">{data.data_source_type}</Badge>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <QuickLink to="/app/activity" icon={<ArrowUpRight size={19} />} title="Aktivitas" detail="Lihat transaksi Anda" />
        <QuickLink to="/app/inbox" icon={<MessageCircle size={19} />} title="Inbox" detail="Pesan dan penawaran" />
        <QuickLink to="/app/financing" icon={<CalendarDays size={19} />} title="Financing" detail="Pantau pengajuan simulasi" />
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-line p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">Personal context</p>
            <h2 className="mt-1 font-display text-xl font-bold">Ringkasan hubungan</h2>
          </div>
          <Sparkles className="text-orange-500" size={20} />
        </div>
        <div className="grid gap-5 p-5 sm:grid-cols-3">
          <Metric label="Persona" value={data.persona.replaceAll("_", " ")} />
          <Metric label="Status Perilaku" value={data.behavior_status.replaceAll("_", " ")} />
          <Metric label="Sumber data" value={data.data_source_type} />
        </div>
      </Card>
      
      <p className="text-xs text-center text-slate-400 mt-4">{data.disclaimer}</p>
    </div>
  );
}

function QuickLink({ to, icon, title, detail }: { to: string; icon: React.ReactNode; title: string; detail: string }) { 
  return (
    <Link to={to} className="group rounded-2xl border border-line bg-white p-5 shadow-soft transition hover:-translate-y-0.5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">{icon}</span>
      <span className="mt-5 block font-bold">{title}</span>
      <span className="mt-1 block text-sm text-slate-500">{detail}</span>
      <ChevronRight className="mt-4 text-slate-300 transition group-hover:translate-x-1" size={17} />
    </Link>
  ); 
}

function Metric({ label, value }: { label: string; value: string }) { 
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-2 break-words font-bold text-ink">{value}</p>
    </div>
  ); 
}