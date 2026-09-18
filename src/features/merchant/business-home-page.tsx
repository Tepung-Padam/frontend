import { ArrowDownLeft, ArrowUpRight, Building2, Clock, Gauge, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import { useSession } from "@/features/auth/use-session";
import { CapabilityGap } from "@/components/feedback/capability-gap";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/feedback/loading-state";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { codeLabel, formatCurrency, formatDate } from "@/lib/format";
import type { RiskLevel } from "@/types/domain";

const riskTone: Record<RiskLevel, "success" | "warning" | "danger"> = {
  LOW: "success",
  MEDIUM: "warning",
  HIGH: "danger",
};

export function BusinessHomePage() {
  const { user } = useSession();
  const merchant = useQuery({ queryKey: ["merchant-summary"], queryFn: api.merchantSummary, enabled: user?.role === "MERCHANT" });
  if (merchant.isLoading) return <LoadingState />;
  if (merchant.isError || !merchant.data)
    return <CapabilityGap title="Ringkasan usaha belum tersedia" detail="Backend belum memiliki ringkasan untuk persona merchant ini." />;

  const summary = merchant.data;
  const metrics = summary.metrics;

  return (
    <div className="space-y-7">
      <div>
        <p className="text-xs font-semibold text-business-faint">Dashboard</p>
        <h1 className="mt-2 text-3xl font-bold text-business-navy">Ringkasan usaha</h1>
      </div>

      <header className="rounded-2xl border border-business-border bg-white p-6 shadow-[0_4px_18px_rgba(19,48,91,0.06)] sm:p-7">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-orange-50 text-business-accent">
              <Building2 size={22} />
            </span>
            <div>
              <h2 className="text-xl font-bold text-business-navy">{summary.customer_ref}</h2>
              <p className="mt-1 text-xs text-business-muted">Jendela evaluasi {summary.window_days} hari</p>
            </div>
          </div>
          <Badge tone={summary.risk_indicator ? riskTone[summary.risk_indicator] : "unavailable"}>
            {summary.risk_indicator ? `Risiko ${codeLabel(summary.risk_indicator)}` : "Risiko belum tersedia"}
          </Badge>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-business-borderLight pt-4 text-xs text-business-muted">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-business-success" />
            Status {codeLabel(summary.status)}
          </span>
          <span>Data per {formatDate(summary.as_of_date)}</span>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={<ArrowDownLeft />} label="Settlement masuk" value={formatCurrency(metrics.incoming_settlement)} detail="Dana masuk tercatat" tone="success" />
        <MetricCard icon={<ArrowUpRight />} label="Transfer keluar cocok" value={formatCurrency(metrics.matched_outgoing_transfer)} detail="Tercocokkan dengan settlement" tone="accent" />
        <MetricCard icon={<WalletCards />} label="Total dana keluar" value={formatCurrency(metrics.total_outgoing)} detail="Seluruh arus keluar" />
        <MetricCard
          icon={<Gauge />}
          label="Saldo rata-rata"
          value={metrics.average_balance == null ? "Belum tersedia" : formatCurrency(metrics.average_balance)}
          detail={`Riwayat saldo ${summary.balance_days_available} hari`}
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="border-business-border p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-business-accent">Rasio dana tertahan</p>
              <h2 className="mt-2 font-display text-xl font-bold text-business-navy">Proxy retensi settlement</h2>
            </div>
            <Gauge className="text-business-info" size={22} />
          </div>
          <p className="mt-6 font-display text-4xl font-bold text-business-ink">
            {metrics.retained_ratio_proxy == null ? "Belum tersedia" : `${Math.round(metrics.retained_ratio_proxy * 100)}%`}
          </p>
          <p className="mt-2 max-w-md text-sm leading-6 text-business-muted">
            Proporsi settlement yang tidak langsung ditransfer keluar dalam jendela {summary.window_days} hari — indikator dana yang mengendap di rekening usaha.
          </p>
        </Card>
        <Card className="flex flex-col justify-between border-business-border bg-business-surfaceAlt p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-business-muted">Kualitas data</p>
            <h2 className="mt-2 font-display text-xl font-bold text-business-navy">Kelengkapan pencocokan</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="inline-flex items-center gap-1.5 text-business-muted">
                  <Clock size={14} />
                  Rata-rata jeda pencocokan
                </dt>
                <dd className="font-semibold text-business-navy">{summary.outflow_match_hours} jam</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-business-muted">Jendela pencocokan lengkap</dt>
                <dd className="font-semibold text-business-navy">{summary.complete_match_window ? "Ya" : "Belum"}</dd>
              </div>
            </dl>
          </div>
          <p className="mt-5 text-xs text-business-faint">Metrik berasal dari layanan retensi merchant.</p>
        </Card>
      </section>

      {summary.recommendation && (
        <Card className="border-business-border p-6 shadow-[0_4px_18px_rgba(19,48,91,0.05)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-orange-50 text-business-accent">
              <Sparkles size={20} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-business-accent">{codeLabel(summary.recommendation.action_type)}</p>
              <h2 className="mt-1 font-display text-lg font-bold text-business-navy">{summary.recommendation.title}</h2>
            </div>
          </div>
        </Card>
      )}

      <p className="text-xs leading-5 text-business-faint">{summary.disclaimer}</p>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  detail,
  tone = "info",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  tone?: "info" | "success" | "accent";
}) {
  const toneClass = tone === "success" ? "text-business-success" : tone === "accent" ? "text-business-accent" : "text-business-info";
  return (
    <Card className="border-business-border p-5">
      <div className={toneClass}>{icon}</div>
      <p className="mt-5 text-xs font-bold uppercase tracking-wider text-business-faint">{label}</p>
      <p className="mt-2 truncate font-display text-xl font-bold text-business-ink">{value}</p>
      <p className="mt-1 text-xs text-business-muted">{detail}</p>
    </Card>
  );
}
