import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownLeft, ArrowRight, ArrowUpRight, Building2, ChartNoAxesCombined, Check, FileText, Gauge, Mail, Settings2, ShieldCheck, SlidersHorizontal, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { EmptyState } from "@/components/feedback/empty-state";
import { codeLabel, formatCurrency, formatDate } from "@/lib/format";

const pillars = [
  { id: "grow", eyebrow: "Pilar pertumbuhan", title: "Grow", detail: "Tingkatkan volume penjualan, margin keuntungan, dan penetrasi pasar.", icon: ChartNoAxesCombined },
  { id: "expand", eyebrow: "Pilar skala dan jangkauan", title: "Ekspansi", detail: "Buka cabang, perluas rantai pasok regional, atau akuisisi aset produktif.", icon: Building2 },
  { id: "operate", eyebrow: "Pilar ketahanan dan efisiensi", title: "Manage Operasi", detail: "Kelola biaya operasional, modal kerja, dan risiko arus kas.", icon: SlidersHorizontal },
];

export function CorporateAdvisoryPage() {
  const [selected, setSelected] = useState("expand");
  const summary = useQuery({ queryKey: ["corporate-summary"], queryFn: api.corporateSummary });
  if (summary.isLoading) return <LoadingState />;
  if (summary.isError || !summary.data) return <ErrorState message="Analisis perusahaan belum dapat dimuat." onRetry={() => void summary.refetch()} />;
  const data = summary.data;
  const companyName = displayCompany(data.company_ref);
  const industryName = displayIndustry(data.industry_category);
  return <div className="space-y-6">
    <div><p className="text-xs font-semibold text-[#7c8da3]">Dashboard / AI Advisory</p><h1 className="mt-2 text-3xl font-bold text-[#10243e]">Mau bawa bisnis kamu ke mana?</h1></div>
    <CompanyStrip name={companyName} reference={data.company_ref} industry={industryName} balance={formatCurrency(data.accounts_summary.total_balance ?? "0", data.accounts_summary.primary_currency)} cashflow={formatCurrency(data.cashflow_totals_30d.incoming_30d)} />
    <section className="grid gap-4 md:grid-cols-3">{pillars.map(({ id, eyebrow, title, detail, icon: Icon }) => { const active = selected === id; return <button key={id} type="button" onClick={() => setSelected(id)} className={`relative min-h-64 rounded-2xl border bg-white p-6 text-left transition ${active ? "border-[#f26522] shadow-[0_8px_24px_rgba(242,101,34,0.12)]" : "border-[#e2e8f1] hover:border-[#a9bdd6]"}`}><span className={`grid h-12 w-12 place-items-center rounded-xl ${active ? "bg-[#f26522] text-white" : "bg-[#eaf1fb] text-[#1d5f9f]"}`}><Icon size={22} /></span><span className={`absolute right-6 top-6 grid h-5 w-5 place-items-center rounded-full border ${active ? "border-[#f26522] bg-[#f26522] text-white" : "border-[#afc3dd] bg-[#eaf1fb]"}`}>{active ? <Check size={12} /> : null}</span><p className="mt-5 text-[11px] font-bold uppercase tracking-wide text-[#536d91]">{eyebrow}</p><h2 className="mt-1 text-xl font-bold text-[#10243e]">{title}</h2><p className="mt-3 text-sm leading-6 text-[#62758f]">{detail}</p></button>; })}</section>
    <Card className="border-[#dae5f4] bg-[#edf4ff] p-6"><div className="flex items-start gap-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#ffe8dc] text-[#c95116]"><Gauge size={19} /></span><div className="min-w-0 flex-1"><h2 className="font-bold text-[#173b68]">Ringkasan analisis rekomendasi awal</h2><p className="mt-1 text-sm text-[#6e625d]">Tiga skenario disusun dari ringkasan perusahaan dan arus kas yang tersedia.</p><div className="mt-5 grid gap-3 md:grid-cols-3"><Scenario label="Skenario I" title="Investasi aset produktif" detail="Simulasi fasilitas investasi" /><Scenario label="Skenario II" title="Supply chain financing" detail="Dukungan modal kerja" /><Scenario label="Skenario III" title="Cash management" detail="Kontrol arus kas perusahaan" /></div></div></div></Card>
    <div className="flex justify-end"><Link to="/corporate/financing"><Button>Lanjutkan <ArrowRight size={16} /></Button></Link></div>
  </div>;
}

export function CorporateNotificationsPage() {
  const messages = useQuery({ queryKey: ["corporate-messages"], queryFn: () => api.messages() });
  if (messages.isLoading) return <LoadingState />;
  if (messages.isError || !messages.data) return <ErrorState message="Notifikasi belum dapat dimuat." onRetry={() => void messages.refetch()} />;
  return <div className="space-y-6"><div><p className="text-xs font-semibold text-[#7c8da3]">Dashboard / Notifikasi</p><h1 className="mt-2 text-3xl font-bold text-[#10243e]">Notifikasi perusahaan</h1><p className="mt-1 text-sm text-[#6e7f94]">Pembaruan layanan, penawaran, dan tindak lanjut perusahaan.</p></div>{messages.data.items.length === 0 ? <EmptyState title="Belum ada notifikasi" detail="Notifikasi baru dari backend akan muncul di halaman ini." /> : <div className="space-y-3">{messages.data.items.map((message) => <Card key={message.id} className="flex gap-4 border-[#dfe7f2] p-5"><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${message.response_state === null ? "bg-[#fff1e9] text-[#f26522]" : "bg-[#eaf1f8] text-[#1d5f9f]"}`}><Mail size={19} /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><h2 className="font-bold text-[#173b68]">{message.title}</h2>{message.response_state ? <Badge tone="info">{codeLabel(message.response_state)}</Badge> : <Badge tone="warning">Baru</Badge>}</div><p className="mt-2 text-sm leading-6 text-[#62758f]">{message.body}</p><p className="mt-2 text-xs text-[#9aa8b8]">{formatDate(message.created_at)}</p></div></Card>)}</div>}</div>;
}

export function CorporateInvoicesPage() {
  const summary = useQuery({ queryKey: ["corporate-summary"], queryFn: api.corporateSummary });
  if (summary.isLoading) return <LoadingState />;
  if (summary.isError || !summary.data) return <ErrorState message="Arus kas belum dapat dimuat." onRetry={() => void summary.refetch()} />;
  const data = summary.data;
  const flow = data.cashflow_totals_30d;
  const values = [Number(flow.incoming_30d), Number(flow.outgoing_30d), Number(flow.net_cashflow_30d)];
  const max = Math.max(...values.map(Math.abs), 1);
  return <div className="space-y-6"><CompanyStrip name={displayCompany(data.company_ref)} reference={data.company_ref} industry={displayIndustry(data.industry_category)} balance={formatCurrency(data.accounts_summary.total_balance ?? "0", data.accounts_summary.primary_currency)} cashflow={formatCurrency(flow.net_cashflow_30d)} /><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-[11px] font-bold uppercase tracking-wide text-[#b45624]">Cashflow monitoring</p><h1 className="mt-1 text-3xl font-bold text-[#10243e]">Tagihan & Invoice</h1><p className="mt-1 text-sm text-[#6e7f94]">Ringkasan arus kas 30 hari dari backend perusahaan.</p></div><Button variant="secondary"><Settings2 size={16} />Atur tampilan</Button></div>
    <section className="grid gap-4 md:grid-cols-3"><FlowCard icon={<ArrowDownLeft />} label="Pemasukan" value={formatCurrency(flow.incoming_30d)} tone="teal" /><FlowCard icon={<ArrowUpRight />} label="Pengeluaran" value={formatCurrency(flow.outgoing_30d)} tone="orange" /><FlowCard icon={<WalletCards />} label="Arus kas bersih" value={formatCurrency(flow.net_cashflow_30d)} tone="blue" /></section>
    <Card className="border-[#dfe7f2] p-6"><div className="flex items-center justify-between"><div><h2 className="font-bold text-[#173b68]">Komposisi arus kas</h2><p className="mt-1 text-xs text-[#7c8da3]">Periode 30 hari</p></div><ShieldCheck size={19} className="text-[#16805c]" /></div><div className="mt-6 space-y-5"><CashBar label="Dana masuk" value={values[0]} max={max} color="bg-[#159a8c]" /><CashBar label="Dana keluar" value={values[1]} max={max} color="bg-[#f26522]" /><CashBar label="Arus kas bersih" value={values[2]} max={max} color="bg-[#2b65a0]" /></div></Card>
    <Card className="border-[#dfe7f2] p-6"><div><h2 className="font-bold text-[#173b68]">Tren proyeksi likuiditas</h2><p className="mt-1 text-xs text-[#7c8da3]">Visual indikatif berdasarkan agregasi arus kas 30 hari</p></div><CashflowTrend /></Card>
    <Card className="border-[#dfe7f2] p-6"><div className="flex items-center gap-2"><FileText size={18} className="text-[#f26522]" /><h2 className="font-bold text-[#173b68]">Daftar tagihan dan invoice</h2></div><div className="mt-5"><EmptyState title="Data invoice belum tersedia" detail="Backend saat ini menyediakan agregasi arus kas. Daftar invoice akan tampil setelah endpoint invoice tersedia." /></div></Card></div>;
}

function CompanyStrip({ name, reference, industry, balance, cashflow }: { name: string; reference: string; industry: string; balance: string; cashflow: string }) { return <Card className="grid gap-5 border-[#dfe7f2] p-5 sm:grid-cols-[1fr_auto_auto] sm:items-center"><div className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-xl bg-[#eaf1fb] text-[#f26522]"><Building2 size={22} /></span><div><h2 className="font-bold text-[#173b68]">{name}</h2><p className="mt-1 text-xs text-[#62758f]">{industry}</p><p className="mt-1 text-[10px] font-semibold text-[#9aa8b8]">Referensi {reference}</p></div></div><StripMetric label="Saldo efektif" value={balance} /><StripMetric label="Arus kas 30 hari" value={cashflow} /></Card>; }
function StripMetric({ label, value }: { label: string; value: string }) { return <div className="border-t border-[#e3eaf3] pt-3 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0"><p className="text-[10px] font-bold uppercase text-[#7083a0]">{label}</p><p className="mt-1 text-sm font-bold text-[#173b68]">{value}</p></div>; }
function Scenario({ label, title, detail }: { label: string; title: string; detail: string }) { return <div className="rounded-xl bg-white p-4"><p className="text-[10px] font-bold uppercase text-[#61789b]">{label}</p><p className="mt-1 text-sm font-bold text-[#173b68]">{title}</p><p className="mt-1 text-xs text-[#087d70]">{detail}</p></div>; }
function FlowCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: "teal" | "orange" | "blue" }) { const colors = { teal: "bg-[#e8f8f5] text-[#087d70]", orange: "bg-[#fff1e9] text-[#c95116]", blue: "bg-[#eaf1fb] text-[#2b65a0]" }; return <Card className="border-[#dfe7f2] p-5"><span className={`grid h-10 w-10 place-items-center rounded-xl ${colors[tone]}`}>{icon}</span><p className="mt-4 text-xs font-semibold text-[#6e7f94]">{label}</p><p className="mt-2 truncate text-xl font-bold text-[#173b68]">{value}</p></Card>; }
function CashBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) { return <div><div className="mb-2 flex justify-between text-xs"><span className="font-semibold text-[#62758f]">{label}</span><span className="font-bold text-[#173b68]">{formatCurrency(value)}</span></div><div className="h-2.5 overflow-hidden rounded-full bg-[#edf2f8]"><div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(4, Math.abs(value) / max * 100)}%` }} /></div></div>; }
function CashflowTrend() { return <div className="mt-5 overflow-hidden rounded-xl bg-[#f5f8fc] p-3"><svg viewBox="0 0 720 240" className="h-auto w-full" role="img" aria-label="Kurva proyeksi likuiditas"><defs><linearGradient id="cash-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f26522" stopOpacity="0.2" /><stop offset="1" stopColor="#f26522" stopOpacity="0" /></linearGradient></defs>{[40,90,140,190].map((y) => <line key={y} x1="42" y1={y} x2="700" y2={y} stroke="#dfe7f2" strokeDasharray="4 5" />)}<line x1="42" y1="184" x2="700" y2="184" stroke="#dc4545" strokeDasharray="6 5" /><path d="M42 72 L112 58 L182 86 L252 66 L322 102 L392 132 L462 174 L532 126 L602 92 L700 64 L700 214 L42 214 Z" fill="url(#cash-area)" /><polyline points="42,72 112,58 182,86 252,66" fill="none" stroke="#173b68" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /><polyline points="252,66 322,102 392,132 462,174 532,126 602,92 700,64" fill="none" stroke="#f26522" strokeWidth="4" strokeDasharray="8 6" strokeLinecap="round" strokeLinejoin="round" />{[[42,72],[112,58],[182,86],[252,66],[322,102],[392,132],[462,174],[532,126],[602,92],[700,64]].map(([x,y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="5" fill="white" stroke={x <= 252 ? "#173b68" : "#f26522"} strokeWidth="3" />)}<text x="48" y="207" fontSize="11" fill="#8a99ac">Awal periode</text><text x="614" y="207" fontSize="11" fill="#8a99ac">30 hari</text></svg></div>; }
function displayCompany(reference: string) { return reference.startsWith("CORP-") ? "PT Rekaguna Integra Perkasa" : reference; }
function displayIndustry(industry: string | null) { return industry?.startsWith("SYNTHETIC") ? "Manufaktur Presisi & Alat Berat" : codeLabel(industry); }
