import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { api } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { EmptyState } from "@/components/feedback/empty-state";
import type { AtRiskCustomer, RiskLevel } from "@/types/domain";

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
              <Badge tone={riskTone(customer.risk_level)}>{customer.risk_level}</Badge>
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
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  State
                </dt>
                <dd className="mt-1 font-bold">{customer.state.replaceAll("_", " ")}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Type
                </dt>
                <dd className="mt-1 font-bold">{customer.customer_type}</dd>
              </div>
              {customer.recommended_action && (
                <div className="col-span-2">
                  <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Recommended action
                  </dt>
                  <dd className="mt-1 font-bold text-teal-700">
                    {customer.recommended_action.replaceAll("_", " ")}
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
                      : "—",
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
                    <p className="text-sm font-bold">{driver.message}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Feature: {driver.feature} · Impact:{" "}
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
            {recommendations.data && recommendations.data.length === 0 && (
              <p className="mt-3 text-sm text-slate-500">Tidak ada rekomendasi aktif.</p>
            )}
            {recommendations.data && recommendations.data.length > 0 && (
              <div className="mt-3 space-y-3">
                {recommendations.data.map((rec) => (
                  <div
                    key={rec.id}
                    className="rounded-xl border border-line bg-paper p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-sm">{rec.title}</p>
                      <Badge tone="neutral">
                        {rec.action_type.replaceAll("_", " ")}
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

  const query = useQuery({
    queryKey: ["at-risk"],
    queryFn: api.atRisk,
  });

  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data?.items) {
    return (
      <ErrorState
        message="Daftar at-risk belum dapat dimuat."
        onRetry={() => void query.refetch()}
      />
    );
  }

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

        {query.data.items.length === 0 ? (
          <EmptyState
            title="Tidak ada nasabah at-risk"
            detail="Saat ini tidak ada nasabah dengan tingkat risiko Medium atau High yang terdeteksi."
          />
        ) : (
          <Card className="overflow-x-auto">
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
                {query.data.items.map((customer) => (
                  <tr
                    key={customer.id}
                    className="transition hover:bg-paper"
                  >
                    <td className="px-5 py-4">
                      <p className="font-bold">{customer.customer_ref}</p>
                      <p className="text-xs text-slate-500">
                        {customer.customer_type} · {customer.state.replaceAll("_", " ")}
                      </p>
                    </td>
                    <td className="px-3 py-4">
                      <Badge tone={riskTone(customer.risk_level)}>
                        {customer.risk_level}
                      </Badge>
                    </td>
                    <td className="px-3 py-4 font-bold">
                      {Math.round(customer.probability * 100)}%
                    </td>
                    <td className="px-3 py-4 text-slate-600">
                      {customer.relationship_score != null
                        ? customer.relationship_score.toFixed(1)
                        : "—"}
                    </td>
                    <td className="px-3 py-4 text-xs text-slate-500">
                      {customer.recommended_action?.replaceAll("_", " ") ?? "—"}
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
        )}
      </div>
    </>
  );
}