import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { EmptyState } from "@/components/feedback/empty-state";
import type { AtRiskCustomer, RiskLevel } from "@/types/domain";
import { codeLabel, modelFeatureLabel } from "@/lib/format";

function riskTone(level: RiskLevel): "danger" | "warning" | "success" {
  if (level === "HIGH") return "danger";
  if (level === "MEDIUM") return "warning";
  return "success";
}

// ── Customer detail panel ─────────────────────────────────────────────────────

function CustomerDetailPanel({
  customer,
  onClose,
}: {
  customer: AtRiskCustomer;
  onClose: () => void;
}) {
  const behavior = useQuery({
    queryKey: ["behavior", customer.id],
    queryFn: () => api.behavior(customer.id),
  });
  const churn = useQuery({
    queryKey: ["churn", customer.id],
    queryFn: () => api.churn(customer.id),
  });
  const recommendations = useQuery({
    queryKey: ["recommendations", customer.id],
    queryFn: () => api.recommendations(customer.id),
  });

  return (
    <div className="fixed inset-0 z-30 flex justify-end bg-black/30 backdrop-blur-sm">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white px-6 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
              Customer detail
            </p>
            <h2 className="mt-0.5 font-display text-lg font-bold">{customer.customer_ref}</h2>
          </div>
          <button
            aria-label="Tutup"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 hover:bg-paper"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          {/* Summary */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">Risk profile</h3>
              <Badge tone={riskTone(customer.risk_level)}>{codeLabel(customer.risk_level)}</Badge>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Churn probability
                </dt>
                <dd className="mt-1 font-bold">
                  {Math.round(customer.probability * 100)}%
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Relationship score
                </dt>
                <dd className="mt-1 font-bold">
                  {customer.relationship_score != null
                    ? customer.relationship_score
                    : "Belum tersedia"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  State
                </dt>
                <dd className="mt-1 font-bold">{codeLabel(customer.state)}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Type
                </dt>
                <dd className="mt-1 font-bold">{codeLabel(customer.customer_type)}</dd>
              </div>
              {customer.recommended_action && (
                <div className="col-span-2">
                  <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Recommended action
                  </dt>
                  <dd className="mt-1 font-bold text-teal-700">
                    {codeLabel(customer.recommended_action)}
                  </dd>
                </div>
              )}
            </dl>
          </Card>

          {/* Behavior metrics */}
          <Card className="p-5">
            <h3 className="font-bold">Behavior metrics</h3>
            {behavior.isLoading && (
              <div className="mt-3">
                <LoadingState />
              </div>
            )}
            {behavior.isError && (
              <p className="mt-3 text-sm text-slate-500">Data perilaku belum tersedia.</p>
            )}
            {behavior.data && (
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Transaksi 7 hari", String(behavior.data.metrics.txn_count_7d)],
                  ["Transaksi 30 hari", String(behavior.data.metrics.txn_count_30d)],
                  ["QRIS 30 hari", String(behavior.data.metrics.qris_txn_count_30d)],
                  ["Bill payment 30h", String(behavior.data.metrics.bill_payment_count_30d)],
                  [
                    "Hari sejak transaksi",
                    behavior.data.metrics.days_since_last_transaction != null
                      ? String(behavior.data.metrics.days_since_last_transaction)
                      : "Belum tersedia",
                  ],
                  ["App sessions 30h", String(behavior.data.metrics.app_sessions_30d)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {label}
                    </dt>
                    <dd className="mt-0.5 font-bold">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </Card>

          {/* Churn drivers */}
          {churn.data && churn.data.top_drivers.length > 0 && (
            <Card className="p-5">
              <h3 className="font-bold">Top churn drivers</h3>
              <div className="mt-3 divide-y divide-line">
                {churn.data.top_drivers.map((driver, i) => (
                  <div key={i} className="py-3">
                    <p className="text-sm font-bold">{modelFeatureLabel(driver.feature)}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Kontribusi terhadap skor:{" "}
                      {driver.impact > 0 ? "+" : ""}
                      {driver.impact.toFixed(3)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recommendations */}
          <Card className="p-5">
            <h3 className="font-bold">Rekomendasi AI</h3>
            {recommendations.isLoading && (
              <div className="mt-3">
                <LoadingState />
              </div>
            )}
            {recommendations.isError && (
              <p className="mt-3 text-sm text-slate-500">Rekomendasi belum tersedia.</p>
            )}
            {recommendations.data && recommendations.data.items.length === 0 && (
              <p className="mt-3 text-sm text-slate-500">Tidak ada rekomendasi aktif.</p>
            )}
            {recommendations.data && recommendations.data.items.length > 0 && (
              <div className="mt-3 space-y-3">
                {recommendations.data.items.map((rec) => (
                  <div
                    key={rec.id}
                    className="rounded-xl border border-line bg-paper p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-sm">{rec.title}</p>
                      <Badge tone="neutral">
                        {codeLabel(rec.action_type)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">{rec.description}</p>
                    <p className="mt-2 text-xs text-slate-400">
                      Priority: {rec.priority_score.toFixed(2)} · {rec.reason}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function RetentionPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<AtRiskCustomer | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<"ALL" | RiskLevel>("ALL");

  const query = useQuery({
    queryKey: ["at-risk", page],
    queryFn: () => api.atRisk(page, 100),
  });
  const summary = useQuery({ queryKey: ["retention-summary"], queryFn: api.retentionSummary });
  const model = useQuery({ queryKey: ["active-model"], queryFn: api.activeModel });

  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data?.items) {
    return (
      <ErrorState
        message="Daftar at-risk belum dapat dimuat."
        onRetry={() => void query.refetch()}
      />
    );
  }

  const riskData = [
    { name: "Risiko tinggi", value: summary.data?.risk.HIGH ?? query.data.items.filter((item) => item.risk_level === "HIGH").length, color: "#dc4c4c" },
    { name: "Risiko menengah", value: summary.data?.risk.MEDIUM ?? query.data.items.filter((item) => item.risk_level === "MEDIUM").length, color: "#d99522" },
    { name: "Risiko rendah", value: summary.data?.risk.LOW ?? 0, color: "#167b76" },
    { name: "Belum tersedia", value: summary.data?.risk.UNAVAILABLE ?? 0, color: "#a5adb2" },
  ];
  const relationshipData = [
    { name: "Lemah", value: summary.data?.relationship_score.weak ?? 0 },
    { name: "Moderat", value: summary.data?.relationship_score.moderate ?? 0 },
    { name: "Kuat", value: summary.data?.relationship_score.strong ?? 0 },
  ];
  const visibleCustomers = query.data.items.filter((customer) => {
    const term = search.trim().toLowerCase();
    const matchesRisk = riskFilter === "ALL" || customer.risk_level === riskFilter;
    const matchesSearch = !term || [customer.customer_ref, customer.segment, customer.customer_type, customer.state]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(term));
    return matchesRisk && matchesSearch;
  });

  return (
    <>
      {selectedCustomer && (
        <CustomerDetailPanel
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}

      <div className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">
              Retention
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold">At-risk customers</h1>
            <p className="mt-2 text-slate-500">
              {query.data.pagination.total_items} nasabah dengan risiko medium/high
              terdeteksi model aktif.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => void query.refetch()}
            disabled={query.isFetching}
          >
            {query.isFetching ? "Memuat..." : "Refresh"}
          </Button>
        </div>

        <div className={`border-l-2 p-4 ${model.data?.is_available ? "border-teal-500 bg-teal-50/60" : "border-amber-500 bg-amber-50/60"}`}>
          <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold">{model.data?.is_available ? `Model aktif · ${model.data.version ?? "versi tersedia"}` : "Model prediksi belum tersedia"}</p><Badge tone={model.data?.is_available ? "success" : "unavailable"}>{model.data?.is_available ? "ACTIVE" : "UNAVAILABLE"}</Badge></div>
          <p className="mt-1 text-xs leading-5 text-slate-600">{model.isError ? "Status model tidak dapat dibaca karena layanan backend tidak terhubung." : model.data?.disclosure ?? "Prediction hanya dapat tampil setelah release model aktif tersedia di backend."}</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="p-5"><div><h2 className="font-display text-lg font-bold">Kurva distribusi risiko</h2><p className="mt-1 text-xs text-slate-500">Agregasi portfolio dari prediction tersimpan.</p></div><div className="mt-5 h-64" aria-label="Kurva distribusi risiko"><ResponsiveContainer width="100%" height="100%"><AreaChart data={riskData} margin={{ top: 10, right: 12, left: -16, bottom: 6 }}><defs><linearGradient id="riskArea" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#e87532" stopOpacity={0.32} /><stop offset="95%" stopColor="#e87532" stopOpacity={0.02} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e3e2dc" /><XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} /><Tooltip formatter={(value) => [Number(value), "Nasabah"]} /><Area type="monotone" dataKey="value" stroke="#e87532" strokeWidth={3} fill="url(#riskArea)" activeDot={{ r: 5 }} /></AreaChart></ResponsiveContainer></div></Card>
          <Card className="p-5"><div className="flex items-start justify-between gap-3"><div><h2 className="font-display text-lg font-bold">Kekuatan hubungan nasabah</h2><p className="mt-1 text-xs text-slate-500">Distribusi Relationship Score seluruh portfolio.</p></div><span className="text-right text-xs text-slate-500">Rata-rata<br /><strong className="text-base text-ink">{summary.data?.relationship_score.average?.toFixed(1) ?? "Belum tersedia"}</strong></span></div><div className="mt-5 h-64" aria-label="Chart relationship score"><ResponsiveContainer width="100%" height="100%"><BarChart data={relationshipData} margin={{ top: 10, right: 8, left: -18, bottom: 4 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e3e2dc" /><XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} /><Tooltip cursor={{ fill: "#f6f5f1" }} formatter={(value) => [Number(value), "Nasabah"]} /><Bar dataKey="value" fill="#167b76" radius={[7, 7, 0, 0]} maxBarSize={58} /></BarChart></ResponsiveContainer></div></Card>
        </div>

        <Card className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <label className="relative block flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari ID, referensi, atau segmen" className="w-full rounded-xl border border-line bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-orange-400" />
            </label>
            <div className="flex gap-2 overflow-x-auto">
              {(["ALL", "HIGH", "MEDIUM", "LOW"] as const).map((filter) => <button key={filter} type="button" onClick={() => setRiskFilter(filter)} className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-bold ${riskFilter === filter ? "bg-[#17343b] text-white" : "bg-paper text-slate-500"}`}>{filter === "ALL" ? "Semua" : codeLabel(filter)}</button>)}
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">Menampilkan {visibleCustomers.length} dari {query.data.items.length} nasabah pada halaman ini.</p>
        </Card>

        {visibleCustomers.length === 0 ? (
          <EmptyState
            title={query.data.items.length === 0 ? "Prediction at-risk belum tersedia" : "Nasabah tidak ditemukan"}
            detail={query.data.items.length === 0 ? "Endpoint hanya mengembalikan nasabah dengan prediction tersimpan berlevel Medium atau High." : "Ubah kata kunci atau filter risiko untuk melihat nasabah lain."}
          />
        ) : (
          <>
          <div className="divide-y divide-line border-y border-line md:hidden">
            {visibleCustomers.map((customer) => (
              <button key={customer.id} type="button" className="w-full py-4 text-left" onClick={() => setSelectedCustomer(customer)}>
                <div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{customer.customer_ref}</p><p className="mt-1 text-xs text-slate-500">{codeLabel(customer.customer_type)} | {customer.segment ?? "Tanpa segmen"}</p></div><Badge tone={riskTone(customer.risk_level)}>{codeLabel(customer.risk_level)}</Badge></div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm"><div><p className="text-xs text-slate-500">Probabilitas churn</p><p className="mt-1 font-semibold tabular-nums">{Math.round(customer.probability * 100)}%</p></div><div><p className="text-xs text-slate-500">Relationship Score</p><p className="mt-1 font-semibold tabular-nums">{customer.relationship_score?.toFixed(1) ?? "Belum tersedia"}</p></div></div>
              </button>
            ))}
          </div>
          <Card className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-line text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-4">Nasabah</th>
                  <th className="px-3 py-4">Risk</th>
                  <th className="px-3 py-4">Probability</th>
                  <th className="px-3 py-4">Rel. score</th>
                  <th className="px-3 py-4">Action</th>
                  <th className="px-3 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visibleCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="transition hover:bg-paper"
                  >
                    <td className="px-5 py-4">
                      <p className="font-bold">{customer.customer_ref}</p>
                      <p className="text-xs text-slate-500">
                        {codeLabel(customer.customer_type)} | {codeLabel(customer.state)}
                      </p>
                    </td>
                    <td className="px-3 py-4">
                      <Badge tone={riskTone(customer.risk_level)}>
                        {codeLabel(customer.risk_level)}
                      </Badge>
                    </td>
                    <td className="px-3 py-4 font-bold">
                      {Math.round(customer.probability * 100)}%
                    </td>
                    <td className="px-3 py-4 text-slate-600">
                      {customer.relationship_score != null
                        ? customer.relationship_score.toFixed(1)
                        : "Belum tersedia"}
                    </td>
                    <td className="px-3 py-4 text-xs text-slate-500">
                      {codeLabel(customer.recommended_action)}
                    </td>
                    <td className="px-3 py-4">
                      <Button
                        variant="secondary"
                        className="text-xs"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        Detail
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          </>
        )}
        {query.data.pagination.total_pages > 1 && <div className="flex items-center justify-between border-t border-line pt-4"><p className="text-sm text-slate-500">Halaman {query.data.pagination.page} dari {query.data.pagination.total_pages} · {query.data.pagination.total_items} nasabah</p><div className="flex gap-2"><Button variant="secondary" disabled={page <= 1 || query.isFetching} onClick={() => setPage((current) => Math.max(1, current - 1))}>Sebelumnya</Button><Button variant="secondary" disabled={page >= query.data.pagination.total_pages || query.isFetching} onClick={() => setPage((current) => current + 1)}>Berikutnya</Button></div></div>}
      </div>
    </>
  );
}
