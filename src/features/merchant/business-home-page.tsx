import { ArrowDownLeft, ArrowRight, ArrowUpRight, Building2, FileText, Landmark, ShieldCheck, WalletCards } from "lucide-react";
import { useSession } from "@/features/auth/use-session";
import { CapabilityGap } from "@/components/feedback/capability-gap";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/feedback/loading-state";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { codeLabel, formatCurrency, formatDate, roleLabel } from "@/lib/format";
import { Link } from "react-router-dom";

export function BusinessHomePage() {
  const { user } = useSession();
  const merchant = useQuery({ queryKey: ["merchant-summary"], queryFn: api.merchantSummary, enabled: user?.role === "MERCHANT" });
  const corporate = useQuery({ queryKey: ["corporate-summary"], queryFn: api.corporateSummary, enabled: user?.role === "CORPORATE" });
  if (merchant.isLoading || corporate.isLoading) return <LoadingState />;
  if (user?.role === "CORPORATE") return <CorporateOverview query={corporate} />;
  if (merchant.isError || !merchant.data) return <CapabilityGap title="Business summary belum tersedia" detail="Backend belum memiliki ringkasan untuk persona merchant ini." />;
  const summary = merchant.data;
  return <div className="space-y-7"><header><p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600">{roleLabel(user?.role ?? "MERCHANT")}</p><h1 className="mt-2 font-display text-3xl font-bold">Business overview</h1><p className="mt-2 text-slate-500">Ringkasan hubungan bisnis dan settlement.</p></header><Card className="grid gap-5 p-6 sm:grid-cols-3"><Metric label="Settlement inflow" value={formatCurrency(summary.metrics.incoming_settlement)} /><Metric label="Retained ratio" value={summary.metrics.retained_ratio_proxy == null ? "Belum tersedia" : `${Math.round(summary.metrics.retained_ratio_proxy * 100)}%`} /><Metric label="Status" value={codeLabel(summary.status)} /></Card><p className="text-sm text-slate-500">{summary.disclaimer}</p></div>;
}

function CorporateOverview({ query }: { query: ReturnType<typeof useQuery> }) {
  const summary = query.data as Awaited<ReturnType<typeof api.corporateSummary>> | undefined;
  if (query.isError || !summary) return <CapabilityGap title="Ringkasan perusahaan belum tersedia" detail="Data corporate belum dapat dimuat dari backend." />;
  const scoreTone = summary.score_status.status === "HEALTHY" ? "success" : summary.score_status.status === "UNAVAILABLE" ? "unavailable" : "warning";
  const companyName = summary.company_ref.startsWith("CORP-") ? "PT Rekaguna Integra Perkasa" : summary.company_ref;
  const industryName = summary.industry_category?.startsWith("SYNTHETIC") ? "Manufaktur Presisi & Alat Berat" : codeLabel(summary.industry_category);
  return <div className="space-y-7">
    <div><p className="text-xs font-semibold text-[#7c8da3]">Dashboard</p><h1 className="mt-2 text-3xl font-bold text-[#10243e]">Ringkasan bisnis perusahaan</h1></div>
    <header className="rounded-2xl border border-[#dfe7f2] bg-white p-6 shadow-[0_4px_18px_rgba(19,48,91,0.06)] sm:p-7"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-xl bg-[#eaf1fb] text-[#f26522]"><Building2 size={22} /></span><div><h2 className="text-xl font-bold text-[#173b68]">{companyName}</h2><p className="mt-1 text-xs text-[#6e7f94]">{industryName} · {codeLabel(summary.business_size)}</p><p className="mt-1 text-[10px] font-semibold text-[#9aa8b8]">Referensi {summary.company_ref}</p></div></div><Badge tone="success">Corporate client</Badge></div><div className="mt-6 flex flex-wrap items-center gap-4 border-t border-[#edf1f6] pt-4 text-xs text-[#6e7f94]"><span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#16805c]" />Profil terverifikasi</span><span>Hubungan sejak {formatDate(summary.relationship_start_date)}</span><span>Data per {formatDate(summary.as_of_date)}</span></div></header>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard icon={<WalletCards />} label="Saldo utama" value={formatCurrency(summary.accounts_summary.total_balance ?? "0", summary.accounts_summary.primary_currency)} detail={`${summary.accounts_summary.total_accounts} rekening terhubung`} /><MetricCard icon={<ArrowDownLeft />} label="Dana masuk 30 hari" value={formatCurrency(summary.cashflow_totals_30d.incoming_30d)} detail="Arus masuk tercatat" tone="teal" /><MetricCard icon={<ArrowUpRight />} label="Dana keluar 30 hari" value={formatCurrency(summary.cashflow_totals_30d.outgoing_30d)} detail="Arus keluar tercatat" /><MetricCard icon={<FileText />} label="Pengajuan aktif" value={String(summary.active_simulated_credit_requests_count)} detail="Simulasi pembiayaan" tone="orange" /></section>
    <section className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]"><Card className="border-[#dfe7f2] p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-[#b45624]">Cash flow snapshot</p><h2 className="mt-2 font-display text-xl font-bold text-[#173b68]">Arus kas 30 hari</h2></div><Landmark className="text-[#1d5f9f]" size={22} /></div><div className="mt-6 grid gap-4 sm:grid-cols-3"><Cash label="Dana masuk" value={summary.cashflow_totals_30d.incoming_30d} tone="text-teal-700" /><Cash label="Dana keluar" value={summary.cashflow_totals_30d.outgoing_30d} tone="text-orange-700" /><Cash label="Bersih" value={summary.cashflow_totals_30d.net_cashflow_30d} tone="text-ink" /></div></Card><Card className="flex flex-col justify-between border-[#dfe7f2] bg-[#f7f9fc] p-6"><div><p className="text-xs font-bold uppercase tracking-wider text-[#61789b]">Relationship review</p><h2 className="mt-2 font-display text-xl font-bold text-[#173b68]">Status hubungan</h2><Badge className="mt-4" tone={scoreTone}>{summary.score_status.status === "UNAVAILABLE" ? "Belum tersedia" : codeLabel(summary.score_status.status)}</Badge><p className="mt-3 text-sm leading-6 text-[#62758f]">Skor hubungan konsumer tidak diterapkan pada profil perusahaan.</p></div><p className="mt-5 text-xs text-[#9aa8b8]">Status berasal dari layanan profil Corporate.</p></Card></section>
    <Card className="border-[#dfe7f2] p-6 shadow-[0_4px_18px_rgba(19,48,91,0.05)]"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-xs font-bold uppercase tracking-wider text-[#f26522]">Corporate financing</p><h2 className="mt-2 font-display text-2xl font-bold text-[#173b68]">Kelola pengajuan perusahaan</h2><p className="mt-2 max-w-xl text-sm leading-6 text-[#6e7f94]">Pantau nominal, tahap review, dan dokumen pengajuan dari satu ruang kerja.</p></div><Link to="/corporate/financing"><Button> Buka pengajuan <ArrowRight size={16} /></Button></Link></div></Card>
    <p className="text-xs leading-5 text-slate-400">{summary.disclaimer}</p>
  </div>;
}

function MetricCard({ icon, label, value, detail, tone = "teal" }: { icon: React.ReactNode; label: string; value: string; detail: string; tone?: "teal" | "orange" }) { return <Card className="p-5"><div className={tone === "orange" ? "text-orange-600" : "text-teal-600"}>{icon}</div><p className="mt-5 text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-2 truncate font-display text-xl font-bold">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></Card>; }
function Cash({ label, value, tone }: { label: string; value: string; tone: string }) { return <div className="rounded-2xl bg-paper p-4"><p className="text-xs text-slate-500">{label}</p><p className={`mt-2 truncate font-display text-lg font-bold ${tone}`}>{formatCurrency(value)}</p></div>; }
function Metric({ label, value }: { label: string; value: string }) { return <div><Building2 size={18} className="text-teal-600" /><p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 font-bold">{value}</p></div>; }
