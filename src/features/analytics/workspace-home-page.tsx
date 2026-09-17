import { Link } from "react-router-dom";
import { ArrowRight, Database } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { useSession } from "@/features/auth/use-session";
import { formatPercent } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { PortfolioRiskChart } from "@/components/charts/portfolio-risk-chart";
import { codeLabel } from "@/lib/format";

export function WorkspaceHomePage() {
  const { user } = useSession();
  const prefix = user?.role === "RM" ? "/rm" : "/staff";
  const summary = useQuery({ queryKey: ["retention-summary"], queryFn: api.retentionSummary });
  const model = useQuery({ queryKey: ["active-model"], queryFn: api.activeModel });
  if (summary.isLoading || model.isLoading) return <LoadingState />;
  if (summary.isError || model.isError || !summary.data || !model.data) return <ErrorState message="Ringkasan portfolio belum dapat dimuat." onRetry={() => { void summary.refetch(); void model.refetch(); }} />;
  const atRiskShare = summary.data.customers.total ? summary.data.customers.at_risk / summary.data.customers.total : null;
  const riskData = (["HIGH", "MEDIUM", "LOW", "UNAVAILABLE"] as const).map((level) => ({ name: codeLabel(level), value: summary.data.risk[level] }));
  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-4 border-b border-line pb-6 sm:flex-row sm:items-end">
        <div><p className="text-xs font-semibold uppercase tracking-wider text-orange-600">Portfolio</p><h1 className="mt-2 font-display text-3xl font-bold">Prioritas nasabah</h1><p className="mt-2 max-w-2xl text-sm text-slate-500">Ringkasan risiko, intervensi, dan kesiapan model untuk pekerjaan hari ini.</p></div>
        <Badge tone={model.data.is_available ? "success" : "unavailable"}>{model.data.is_available ? "Model aktif" : "Model belum tersedia"}</Badge>
      </header>

      <section className="grid border-y border-line sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Total portfolio" value={String(summary.data.customers.total)} />
        <Metric label="Nasabah at-risk" value={String(summary.data.customers.at_risk)} meta={formatPercent(atRiskShare)} />
        <Metric label="Intervensi aktif" value={String(summary.data.campaigns.active_simulations)} />
        <Metric label="Prediction belum tersedia" value={String(summary.data.risk.UNAVAILABLE)} />
      </section>

      <Card className="p-5"><div><h2 className="font-display text-lg font-bold">Kurva distribusi risiko</h2><p className="mt-1 text-xs text-slate-500">Jumlah nasabah dari prediction terbaru yang tersimpan.</p></div><div className="mt-4"><PortfolioRiskChart data={riskData} /></div></Card>

      <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
        <section><div className="flex items-center justify-between"><div><h2 className="font-display text-xl font-bold">Pekerjaan utama</h2><p className="mt-1 text-sm text-slate-500">Buka daftar yang memerlukan pemeriksaan.</p></div></div><div className="mt-4 divide-y divide-line border-y border-line"><ActionLink to={`${prefix}/at-risk`} label="Tinjau nasabah at-risk" count={summary.data.customers.at_risk} /><ActionLink to={`${prefix}/campaigns`} label="Kelola intervensi" count={summary.data.campaigns.active_simulations} /><ActionLink to={`${prefix}/applications`} label="Periksa pengajuan kredit" /></div></section>
        <aside className="border-l-2 border-teal-500 bg-teal-50/50 p-5"><div className="flex items-center gap-2 text-teal-700"><Database size={18} /><h2 className="font-semibold">Model dan sumber data</h2></div><p className="mt-3 text-sm leading-6 text-slate-600">Versi model: {model.data.version ?? "Belum tersedia"}</p><p className="mt-2 text-sm leading-6 text-slate-600">{model.data.disclosure}</p><Link to={`${prefix}/models`} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal-700">Buka metadata <ArrowRight size={15} /></Link></aside>
      </div>
    </div>
  );
}

function Metric({ label, value, meta }: { label: string; value: string; meta?: string }) { return <div className="border-b border-line px-1 py-5 sm:border-b-0 sm:border-r sm:px-5 first:pl-0 last:border-r-0"><p className="text-xs font-semibold text-slate-500">{label}</p><div className="mt-2 flex items-baseline gap-2"><p className="font-display text-2xl font-bold tabular-nums">{value}</p>{meta && <span className="text-xs font-semibold text-orange-700">{meta}</span>}</div></div>; }
function ActionLink({ to, label, count }: { to: string; label: string; count?: number }) { return <Link to={to} className="group flex items-center justify-between gap-4 py-4"><span className="font-semibold">{label}</span><span className="flex items-center gap-3 text-sm text-slate-500">{count != null && <span className="tabular-nums">{count}</span>}<ArrowRight className="transition-transform group-hover:translate-x-0.5" size={17} /></span></Link>; }
