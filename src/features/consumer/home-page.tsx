import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Bell, Building2, Check, CircleUserRound, Copy, Eye, EyeOff, Gift, House, Info, QrCode, ReceiptText, Send, TrendingUp, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api-client";
import { useSession } from "@/features/auth/use-session";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { codeLabel, formatCurrency, formatDate, yesterdayUtcDate } from "@/lib/format";

export function ConsumerHomePage() {
  const { user } = useSession();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [copied, setCopied] = useState(false);
  const summary = useQuery({ queryKey: ["my-summary"], queryFn: api.meSummary });
  const engagement = useQuery({
    queryKey: ["engagement-score", yesterdayUtcDate()],
    queryFn: () => api.engagementScore(yesterdayUtcDate()),
  });
  const offers = useQuery({ queryKey: ["offers", "home"], queryFn: () => api.messages(1, 2) });
  const applications = useQuery({ queryKey: ["credit-applications", "/app/financing"], queryFn: () => api.ownCreditApplications(1, 2) });
  if (summary.isLoading) return <LoadingState />;
  if (summary.isError || !summary.data) return <ErrorState message="Ringkasan rekening belum dapat dimuat." onRetry={() => void summary.refetch()} />;

  const primary = summary.data.accounts.find((account) => account.is_primary) ?? summary.data.accounts[0];
  const balance = summary.data.behavior?.metrics.avg_balance_30d ?? "0";
  const displayName = humanName(user?.username ?? summary.data.customer_ref);
  const accountNumber = maskAccount(primary?.account_ref);

  async function copyAccount() {
    if (!primary?.account_ref) return;
    await navigator.clipboard?.writeText(primary.account_ref);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return <div className="space-y-5">
    <section className="pt-1"><div className="flex items-center justify-between"><div className="font-display text-xl font-bold text-[#00647b]">Alta<span className="text-[#ff6b1a]">vest</span><span className="block text-[9px] uppercase tracking-[0.2em] text-[#18836c]">Consumer banking</span></div><div className="flex items-center gap-2"><Link to="/app/inbox" aria-label="Buka notifikasi" className="relative grid h-10 w-10 place-items-center rounded-full text-[#4c5668]"><Bell size={21} /><span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-[#f8f7ff] bg-[#ff6b1a]" /></Link><Link to="/app/profile" className="grid h-11 w-11 place-items-center rounded-full bg-[#00588b] text-white"><CircleUserRound size={23} /></Link></div></div><h1 className="mt-5 text-[26px] font-bold tracking-tight">Halo, {displayName} <span aria-hidden="true">👋</span></h1><div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm"><span className="rounded-full bg-[#d8ebff] px-3 py-1 font-bold text-[#075888]">{codeLabel(primary?.account_type ?? "SAVINGS")}</span></div></section>

    <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#005482] to-[#0872ad] p-6 text-white shadow-[0_10px_22px_rgba(0,84,130,0.2)]"><div className="absolute -bottom-16 -right-10 h-48 w-48 rounded-full bg-white/5" /><div className="absolute right-16 top-5 h-20 w-20 rounded-full bg-white/5" /><div className="relative"><div className="flex items-center justify-between"><button className="inline-flex items-center gap-2 text-sm text-white/85" onClick={() => setBalanceVisible((value) => !value)}>Saldo Rekening Utama {balanceVisible ? <Eye size={18} /> : <EyeOff size={18} />}</button><span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold">{primary?.currency ?? "IDR"}</span></div><p className="mt-5 text-[31px] font-bold tracking-tight">{balanceVisible ? formatCurrency(balance, primary?.currency ?? "IDR") : "Rp ••••••••"}</p><div className="mt-5 flex items-center justify-between border-t border-white/20 pt-4"><div className="flex items-center gap-2 font-mono text-sm tracking-wider text-white/80"><span>{accountNumber}</span><button aria-label="Salin nomor rekening" onClick={() => void copyAccount()} className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 font-sans text-xs font-bold">{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? "Disalin" : "Salin"}</button></div><Link to="/app/offers" className="inline-flex items-center gap-1 text-sm text-white/85">Lihat penawaran <ArrowRight size={16} /></Link></div></div></section>

    <section className="grid grid-cols-4 gap-3"><QuickAction to="/app/activity" label="Aktivitas" icon={<Send />} /><QuickAction to="/app/offers" label="Penawaran" icon={<QrCode />} accent /><QuickAction to="/app/inbox" label="Inbox" icon={<ReceiptText />} /><QuickAction to="/app/financing" label="Pembiayaan" icon={<WalletCards />} /></section>

    {engagement.data && (() => {
      const score = engagement.data.data;
      const tierLabel = { HIGH: "Optimal", MEDIUM: "Baik", LOW: "Perlu tumbuh" }[score.tier];
      const topDriver = Object.entries(score.score_drivers).sort((a, b) => b[1].points - a[1].points)[0];
      return (
        <section className="rounded-[24px] bg-white p-5 shadow-[0_6px_18px_rgba(27,44,73,0.12)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#075888]">Skor keterlibatan</p>
              <h2 className="text-xl font-bold">Engagement Score</h2>
            </div>
            <span className="rounded-full bg-[#6ef0bd] px-3 py-1 text-[11px] font-bold text-[#07523e]">{tierLabel}</span>
          </div>
          <div className="mt-5 flex items-end justify-between">
            <p><span className="text-3xl font-bold text-[#075888]">{score.score}</span><span className="text-lg text-[#515969]"> / {score.max_score}</span></p>
            <p className="text-xs font-bold text-[#515969]">30 hari terakhir</p>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#dfe4fa]"><div className="h-full rounded-full bg-gradient-to-r from-[#00649b] to-[#087c5b]" style={{ width: `${Math.min(100, (score.score / score.max_score) * 100)}%` }} /></div>
          <div className="mt-4 rounded-2xl bg-[#f0f1ff] p-4 text-sm leading-5">
            {topDriver && <p>Kontributor terbesar: {codeLabel(topDriver[0])} ({topDriver[1].points} dari {topDriver[1].cap} poin).</p>}
            <p className="mt-2 flex gap-2 text-xs font-semibold text-[#4f5665]"><Info size={16} className="shrink-0 text-[#075888]" />{score.points_are} Bukan skor kredit.</p>
          </div>
          <Link to="/app/profile" className="mt-4 flex items-center justify-between rounded-2xl bg-[#dde4ff] px-4 py-4 font-bold text-[#075888]"><span className="inline-flex items-center gap-2"><TrendingUp size={18} />Lihat rincian skor</span><ArrowRight size={20} /></Link>
        </section>
      );
    })()}

    <section><div className="flex items-center justify-between"><h2 className="text-xl font-bold">Spesial untuk {displayName.split(" ")[0]}</h2><Link to="/app/offers" className="text-sm font-bold text-[#075888]">Semua</Link></div><div className="mt-3 space-y-3">{offers.data?.items.length ? offers.data.items.map((offer) => <Link key={offer.id} to="/app/offers" className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm"><span className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#ffdec9] to-[#ffc5a3] text-[#a7440c]"><Gift size={27} /></span><div className="min-w-0"><p className="text-[10px] font-bold uppercase text-[#b14e14]">Penawaran pilihan</p><h3 className="mt-0.5 line-clamp-2 font-bold leading-5">{offer.title}</h3><p className="mt-1 line-clamp-2 text-xs leading-4 text-[#626a78]">{offer.body}</p><p className="mt-1 text-[11px] font-bold text-[#075888]">Lihat penawaran <ArrowRight className="inline" size={13} /></p></div></Link>) : <div className="rounded-2xl bg-white p-5 text-sm text-[#687080]">Belum ada penawaran baru dari backend.</div>}{applications.data?.items.slice(0, 1).map((item) => <Link key={item.id} to={`/app/financing/${item.id}`} className="flex gap-3 rounded-2xl bg-[#eef1ff] p-3"><span className="grid h-20 w-20 shrink-0 place-items-center rounded-xl border-b-4 border-[#ff6b1a] bg-[#d9e5ff] text-[#075888]"><House size={27} /></span><div className="min-w-0 py-1"><p className="text-[10px] font-bold text-[#b14e14]">{formatDate(item.created_at)}</p><h3 className="mt-1 font-bold">{codeLabel(item.product_category)}</h3><p className="mt-1 text-xs text-[#626a78]">{formatCurrency(item.requested_amount, item.currency)} · {codeLabel(item.current_stage)}</p><p className="mt-1 text-[11px] font-bold text-[#075888]">Buka pengajuan <ArrowRight className="inline" size={13} /></p></div></Link>)}</div></section>

    <Link to="/app/pockets" className="flex items-center gap-3 rounded-2xl bg-[#e7ebff] p-4"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#087c5b] text-white"><Building2 size={20} /></span><div className="min-w-0 flex-1"><p className="font-bold">Kantong bersama aktif</p><p className="text-xs text-[#626a78]">Atur target dan setoran rutin bersama</p></div><ArrowRight size={19} className="text-[#4f5867]" /></Link>
  </div>;
}

function QuickAction({ to, label, icon, accent = false }: { to: string; label: string; icon: React.ReactNode; accent?: boolean }) { return <Link to={to} className="flex min-w-0 flex-col items-center gap-2 text-center"><span className={`grid h-14 w-14 place-items-center rounded-2xl ${accent ? "bg-[#ffd9c5] text-[#a9470d]" : "bg-[#e9edff] text-[#075888]"} [&>svg]:h-6 [&>svg]:w-6`}>{icon}</span><span className="text-[11px] font-bold">{label}</span></Link>; }
function maskAccount(value?: string) { if (!value) return "Belum tersedia"; const clean = value.replace(/\s/g, ""); return clean.length > 8 ? `${clean.slice(0, 4)} **** ${clean.slice(-4)}` : clean; }
function humanName(value: string) { return value.replace(/^(consumer|eco|comp|bd1)[_-]?/i, "").replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) || "Nasabah"; }
